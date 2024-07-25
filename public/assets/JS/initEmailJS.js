import emailjs from '@emailjs/browser';

document.addEventListener('DOMContentLoaded', () => {
    emailjs.init(import.meta.env.VITE_EMAILJS_API);
});
