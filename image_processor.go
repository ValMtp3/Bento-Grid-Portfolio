// Image Processor - Outil de traitement d'images pour le portfolio (Go)
//
// DESCRIPTION:
//   Ce programme traite les images du dossier public/assets/assets_index/ en les
//   redimensionnant en plusieurs tailles (responsive) et en supprimant
//   optionnellement l'arrière-plan via rembg (IA) appelé via un worker Python.
//   Les images sont converties en WebP avec une qualité optimale selon la taille.
//
// UTILISATION:
//   go run image_processor.go [OPTIONS]
//   go build -o image_processor image_processor.go && ./image_processor [OPTIONS]
//
// PARAMÈTRES DISPONIBLES:
//   --resize-only      Redimensionner uniquement, sans supprimer l'arrière-plan.
//   --force            Forcer le retraitement de TOUTES les images.
//   --model MODEL      Modèle rembg : u2net (défaut), u2netp, u2net_human_seg.
//   --no-parallel      Désactiver le traitement parallèle.
//   --quiet            Mode silencieux.
//   --verbose          Affichage détaillé.
//   --skip-install     Ne pas vérifier/installer rembg si absent.
//
// FICHIERS:
//   - Source : public/assets/assets_index/
//   - Sortie : public/assets/assets_index/{360,400,640,800,1200,1400}/
//   - Exclusions : exclude_bg_removal.txt
//   - Worker Python : image_processor_worker.py

package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/chai2010/webp"
	"github.com/disintegration/imaging"
	_ "golang.org/x/image/webp"
)

const (
	sourceDir    = "public/assets/assets_index"
	excludeFile  = "exclude_bg_removal.txt"
	workerScript = "image_processor_worker.py"
	tempSubdir   = ".tmp_bg_removed"
	defaultModel = "u2net"
)

var sizes = []int{360, 400, 640, 800, 1200, 1400}

var validExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
	".gif":  true,
	".bmp":  true,
}

type result struct {
	filename  string
	width     int
	fileSize  int64
	path      string
	bgRemoved bool
}

type rembgWorker struct {
	cmd    *exec.Cmd
	stdin  *bufio.Writer
	stdout *bufio.Scanner
	mu     sync.Mutex
}

type task struct {
	inputPath string
	outputDir string
	width     int
	tempPath  string
	bgRemoved bool
}

func main() {
	resizeOnly := flag.Bool("resize-only", false, "Seulement redimensionner sans supprimer l'arrière-plan")
	force := flag.Bool("force", false, "Forcer le retraitement de toutes les images")
	noParallel := flag.Bool("no-parallel", false, "Désactiver le traitement parallèle")
	quiet := flag.Bool("quiet", false, "Mode silencieux")
	verbose := flag.Bool("verbose", false, "Affichage détaillé")
	skipInstall := flag.Bool("skip-install", false, "Ne pas vérifier/installer rembg si absent")
	model := flag.String("model", defaultModel, "Modèle rembg : u2net, u2netp, u2net_human_seg")
	flag.Parse()

	if _, err := os.Stat(sourceDir); os.IsNotExist(err) {
		fmt.Fprintf(os.Stderr, "❌ Le dossier '%s' n'existe pas\n", sourceDir)
		os.Exit(1)
	}

	excludeList, err := loadExcludeList()
	if err != nil {
		fmt.Fprintf(os.Stderr, "⚠️  Erreur lecture %s: %v\n", excludeFile, err)
	}

	imageFiles, err := discoverImages(sourceDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌ Erreur scan images: %v\n", err)
		os.Exit(1)
	}

	if len(imageFiles) == 0 {
		fmt.Fprintf(os.Stderr, "❌ Aucune image trouvée dans '%s'\n", sourceDir)
		os.Exit(1)
	}

	sort.Strings(imageFiles)

	needRembg := !*resizeOnly && hasNonExcluded(imageFiles, excludeList)
	var worker *rembgWorker
	if needRembg {
		if !*skipInstall {
			if !checkRembgInstalled() {
				fmt.Fprintln(os.Stderr, "❌ rembg n'est pas installé. Installez avec: uv add rembg[cpu]")
				fmt.Fprintln(os.Stderr, "   Ou relancez avec --skip-install pour ignorer.")
				os.Exit(1)
			}
		}
		if !*quiet {
			fmt.Println("📥 Démarrage du worker rembg...")
		}
		worker, err = startRembgWorker(*model)
		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Erreur démarrage worker rembg: %v\n", err)
			os.Exit(1)
		}
		defer worker.stop()
		if !*quiet {
			fmt.Println("✅ Worker rembg prêt\n")
		}
	}

	if *force {
		cleanupSizeDirs()
	} else {
		ensureSizeDirs()
	}

	originalTotalSize := int64(0)
	for _, path := range imageFiles {
		info, err := os.Stat(path)
		if err == nil {
			originalTotalSize += info.Size()
		}
	}

	// Préparer les tâches
	tasks := prepareTasks(imageFiles, excludeList, *resizeOnly, *force)
	if len(tasks) == 0 {
		if !*quiet {
			fmt.Printf("✅ Toutes les %d images sont déjà à jour (%d tailles chacune).\n\n", len(imageFiles), len(sizes))
			fmt.Println("💡 Utilisez --force pour forcer le retraitement de toutes les images.")
		}
		return
	}

	if !*quiet {
		action := "redimensionner"
		if needRembg {
			action = "traiter"
		}
		fmt.Printf("📦 %d images à %s (sur %d total)\n\n", len(tasks), action, len(imageFiles)*len(sizes))
	}

	// Traitement
	workers := runtime.NumCPU()
	if *noParallel {
		workers = 1
	}

	desc := "🖼️  Redimensionnement"
	if needRembg {
		desc = "🖼️  Suppression arrière-plan"
	}

	processed := int32(0)
	total := len(tasks)

	var mu sync.Mutex
	var resultsSize400 int64
	var withBgSize400 int64
	var withoutBgSize400 int64

	startTime := time.Now()

	if !*quiet {
		fmt.Printf("%s...\n", desc)
	}

	var wg sync.WaitGroup
	taskCh := make(chan task, total)

	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for t := range taskCh {
				res, err := processImage(t, worker)
				if err != nil {
					fmt.Fprintf(os.Stderr, "❌ Erreur %s (%dpx): %v\n", filepath.Base(t.inputPath), t.width, err)
				} else {
					mu.Lock()
					if res.width == 400 {
						resultsSize400 += res.fileSize
						if needRembg {
							if res.bgRemoved {
								withoutBgSize400 += res.fileSize
							} else {
								withBgSize400 += res.fileSize
							}
						}
					}
					mu.Unlock()
					if *verbose && !*quiet {
						fmt.Printf("✓ %s → %dpx (%.1f KB)\n", res.filename, res.width, float64(res.fileSize)/1024)
					}
				}

				current := atomic.AddInt32(&processed, 1)
				if !*quiet && !*verbose {
					fmt.Printf("\r📊 %d/%d images traitées", current, total)
				}
			}
		}()
	}

	for _, t := range tasks {
		taskCh <- t
	}
	close(taskCh)
	wg.Wait()

	if !*quiet {
		fmt.Println() // nouvelle ligne après la progression
	}

	// Nettoyer les temporaires
	cleanupTempDir()

	// Afficher le résumé
	printSummary(originalTotalSize, resultsSize400, withBgSize400, withoutBgSize400, excludeList, needRembg, *model, !*noParallel, *quiet, time.Since(startTime))
}

func loadExcludeList() (map[string]bool, error) {
	list := make(map[string]bool)
	data, err := os.ReadFile(excludeFile)
	if err != nil {
		if os.IsNotExist(err) {
			return list, nil
		}
		return list, err
	}
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		// Nom sans extension
		stem := line
		if idx := strings.LastIndex(line, "."); idx > 0 {
			stem = line[:idx]
		}
		list[stem] = true
	}
	return list, nil
}

func discoverImages(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var images []string
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		ext := strings.ToLower(filepath.Ext(entry.Name()))
		if validExtensions[ext] {
			images = append(images, filepath.Join(dir, entry.Name()))
		}
	}
	return images, nil
}

func hasNonExcluded(images []string, excludeList map[string]bool) bool {
	for _, path := range images {
		stem := strings.TrimSuffix(filepath.Base(path), filepath.Ext(path))
		if !excludeList[stem] {
			return true
		}
	}
	return false
}

func checkRembgInstalled() bool {
	cmd := exec.Command("uv", "run", "python", "-c", "import rembg")
	err := cmd.Run()
	return err == nil
}

func startRembgWorker(model string) (*rembgWorker, error) {
	cmd := exec.Command("uv", "run", "python", workerScript, "--model", model)
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	cmd.Stderr = os.Stderr
	if err := cmd.Start(); err != nil {
		return nil, err
	}

	scanner := bufio.NewScanner(stdout)
	w := &rembgWorker{
		cmd:    cmd,
		stdin:  bufio.NewWriter(stdin),
		stdout: scanner,
	}

	// Attendre le signal ready
	if !scanner.Scan() {
		cmd.Process.Kill()
		return nil, fmt.Errorf("le worker n'a pas envoyé de signal ready")
	}
	var resp struct {
		Status  string `json:"status"`
		Message string `json:"message"`
	}
	if err := json.Unmarshal(scanner.Bytes(), &resp); err != nil {
		cmd.Process.Kill()
		return nil, fmt.Errorf("réponse worker invalide: %v", err)
	}
	if resp.Status != "ready" {
		cmd.Process.Kill()
		return nil, fmt.Errorf("worker n'est pas prêt: %s", resp.Message)
	}
	return w, nil
}

func (w *rembgWorker) remove(input, output string) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	req := map[string]string{"input": input, "output": output}
	data, err := json.Marshal(req)
	if err != nil {
		return err
	}
	if _, err := fmt.Fprintln(w.stdin, string(data)); err != nil {
		return err
	}
	if err := w.stdin.Flush(); err != nil {
		return err
	}
	if !w.stdout.Scan() {
		return fmt.Errorf("worker fermé")
	}
	var resp struct {
		Status  string `json:"status"`
		Message string `json:"message"`
	}
	if err := json.Unmarshal(w.stdout.Bytes(), &resp); err != nil {
		return err
	}
	if resp.Status != "ok" {
		return fmt.Errorf("%s", resp.Message)
	}
	return nil
}

func (w *rembgWorker) stop() {
	if w == nil {
		return
	}
	w.stdin.Flush()
	w.cmd.Process.Kill()
	w.cmd.Wait()
}

func ensureSizeDirs() {
	for _, size := range sizes {
		dir := filepath.Join(sourceDir, fmt.Sprintf("%d", size))
		os.MkdirAll(dir, 0o755)
	}
}

func cleanupSizeDirs() {
	for _, size := range sizes {
		dir := filepath.Join(sourceDir, fmt.Sprintf("%d", size))
		os.RemoveAll(dir)
		os.MkdirAll(dir, 0o755)
	}
}

func cleanupTempDir() {
	dir := filepath.Join(sourceDir, tempSubdir)
	os.RemoveAll(dir)
}

func tempPath(stem string) string {
	dir := filepath.Join(sourceDir, tempSubdir)
	os.MkdirAll(dir, 0o755)
	return filepath.Join(dir, stem+".png")
}

func prepareTasks(images []string, excludeList map[string]bool, resizeOnly, force bool) []task {
	var tasks []task
	for _, path := range images {
		stem := strings.TrimSuffix(filepath.Base(path), filepath.Ext(path))
		excluded := excludeList[stem]
		needsBg := !resizeOnly && !excluded

		var bgTemp string
		if needsBg {
			bgTemp = tempPath(stem)
		}

		for _, size := range sizes {
			outputDir := filepath.Join(sourceDir, fmt.Sprintf("%d", size))
			outputPath := filepath.Join(outputDir, stem+".webp")

			if !force {
				if upToDate(outputPath, path) {
					continue
				}
			}

			tasks = append(tasks, task{
				inputPath: path,
				outputDir: outputDir,
				width:     size,
				tempPath:  bgTemp,
				bgRemoved: needsBg,
			})
		}
	}
	return tasks
}

func upToDate(outputPath, inputPath string) bool {
	outInfo, err := os.Stat(outputPath)
	if err != nil {
		return false
	}
	inInfo, err := os.Stat(inputPath)
	if err != nil {
		return false
	}
	return outInfo.ModTime().After(inInfo.ModTime()) || outInfo.ModTime().Equal(inInfo.ModTime())
}

func processImage(t task, worker *rembgWorker) (*result, error) {
	os.MkdirAll(t.outputDir, 0o755)
	stem := strings.TrimSuffix(filepath.Base(t.inputPath), filepath.Ext(t.inputPath))

	sourcePath := t.inputPath
	if t.tempPath != "" {
		// Vérifier si le temporaire sans fond existe et est à jour
		if !upToDate(t.tempPath, t.inputPath) {
			if worker == nil {
				return nil, fmt.Errorf("worker rembg non disponible")
			}
			if err := worker.remove(t.inputPath, t.tempPath); err != nil {
				return nil, err
			}
		}
		sourcePath = t.tempPath
	}

	img, err := decodeImage(sourcePath)
	if err != nil {
		return nil, fmt.Errorf("décodage image: %w", err)
	}

	img = normalizeImageMode(img)

	aspectRatio := float64(img.Bounds().Dy()) / float64(img.Bounds().Dx())
	newHeight := int(float64(t.width) * aspectRatio)
	if newHeight == 0 {
		newHeight = 1
	}

	resized := imaging.Resize(img, t.width, newHeight, imaging.Lanczos)

	outputPath := filepath.Join(t.outputDir, stem+".webp")
	quality := getOptimalWebPQuality(t.width)
	if t.tempPath != "" {
		// Qualité plus élevée pour la transparence
		quality = 85
	}

	file, err := os.Create(outputPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	if err := webp.Encode(file, resized, &webp.Options{Quality: float32(quality)}); err != nil {
		return nil, fmt.Errorf("encodage webp: %w", err)
	}

	info, err := os.Stat(outputPath)
	if err != nil {
		return nil, err
	}

	return &result{
		filename:  stem + ".webp",
		width:     t.width,
		fileSize:  info.Size(),
		path:      t.inputPath,
		bgRemoved: t.bgRemoved,
	}, nil
}

func decodeImage(path string) (image.Image, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return nil, err
	}
	return img, nil
}

func normalizeImageMode(img image.Image) image.Image {
	switch src := img.(type) {
	case *image.Paletted:
		return imaging.Clone(src)
	case *image.Gray:
		return imaging.Clone(src)
	case *image.Gray16:
		return imaging.Clone(src)
	}
	return img
}

func getOptimalWebPQuality(width int) int {
	switch {
	case width <= 360:
		return 70
	case width <= 400:
		return 75
	case width <= 800:
		return 80
	case width <= 1200:
		return 85
	default:
		return 90
	}
}

func printSummary(original, generated400, withBg400, withoutBg400 int64, excludeList map[string]bool, needRembg bool, model string, parallel bool, quiet bool, elapsed time.Duration) {
	if quiet {
		return
	}

	originalKB := float64(original) / 1024
	generatedKB := float64(generated400) / 1024
	savingsKB := originalKB - generatedKB
	savingsPct := 0.0
	if originalKB > 0 {
		savingsPct = savingsKB / originalKB * 100
	}

	fmt.Println("\n✅ Traitement terminé")
	fmt.Println("📊 Résumé des économies :")
	fmt.Printf("   • Taille originale : %.1f KB\n", originalKB)
	fmt.Printf("   • Taille générée (400px) : %.1f KB\n", generatedKB)
	fmt.Printf("   • Économie totale : %.1f KB (%.1f%%)\n", savingsKB, savingsPct)

	if needRembg && len(excludeList) > 0 && withBg400 > 0 && withoutBg400 > 0 {
		bgSavingsKB := float64(withBg400-withoutBg400) / 1024
		bgSavingsPct := 0.0
		if withBg400 > 0 {
			bgSavingsPct = bgSavingsKB / (float64(withBg400) / 1024) * 100
		}
		fmt.Printf("   • Économie suppression arrière-plan : %.1f KB (%.1f%%)\n", bgSavingsKB, bgSavingsPct)
	}

	mode := "Parallèle"
	if !parallel {
		mode = "Séquentiel"
	}
	fmt.Printf("   • Mode : %s\n", mode)
	if needRembg {
		fmt.Printf("   • Modèle : %s\n", model)
	}
	fmt.Printf("   • Dossier de sortie : %s\n", sourceDir)
	if needRembg && len(excludeList) > 0 {
		fmt.Printf("   • Images exclues de la suppression d'arrière-plan : %d\n", len(excludeList))
	}
	fmt.Printf("   • Durée : %s\n", elapsed.Round(time.Millisecond))
}
