class Toast {
    /**
     * @param {Element} element
     */
    constructor(element) {
        this.element = element;

        this.element.querySelector("button[toast-close-button]").addEventListener("click", () => this.hide());
    }

    show() {
        this.element.classList.remove("toast_hidden");
    }

    hide() {
        this.element.classList.add("toast_hidden");
    }
}