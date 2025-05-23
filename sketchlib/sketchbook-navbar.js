class Navbar extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
        <style>
        @import "/p5-sketchbook/styles/layout.css";
        </style>
        <nav>
            <a href="https://ptrgags.github.io">Peter Gagliardi</a>
            &gt;
            <a href="/p5-sketchbook">Sketchbook</a>
            |
            <a href="https://github.com/ptrgags/p5-sketchbook">GitHub</a>
        </nav>
        `;
  }
}

customElements.define("sketchbook-navbar", Navbar);
