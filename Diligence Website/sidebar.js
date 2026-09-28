document.addEventListener("DOMContentLoaded", () => {
    const body = document.querySelector("body");
    const sidebar = body.querySelector("nav");
    const toggle = body.querySelector(".toggle");
    const modeSwitch = body.querySelector(".toggle-switch");
    const modeText = body.querySelector(".mode-text");
    const navLinks = body.querySelectorAll(".menu-links .nav-link");

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        body.classList.add("dark");

        if (modeText) {
            modeText.innerText = "Light Mode";
        }
    }

    if (localStorage.getItem("sidebarState") === "open" && sidebar) {
        sidebar.classList.remove("close");
    }

    if (toggle && sidebar) {
        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("close");

            localStorage.setItem(
                "sidebarState",
                sidebar.classList.contains("close") ? "closed" : "open"
            );
        });
    }

    if (modeSwitch) {
        modeSwitch.addEventListener("click", () => {
            body.classList.toggle("dark");

            if (body.classList.contains("dark")) {
                if (modeText) {
                    modeText.innerText = "Light Mode";
                }

                localStorage.setItem("theme", "dark");
            } else {
                if (modeText) {
                    modeText.innerText = "Dark Mode";
                }

                localStorage.setItem("theme", "light");
            }
        });
    }

    navLinks.forEach((link) => {
        const textSpan = link.querySelector(".nav-text");
        const tabName = textSpan
            ? textSpan.textContent.trim().toLowerCase()
            : "";

        if (window.location.pathname.includes(tabName)) {
            link.classList.add("active");
        }

        link.addEventListener("click", (e) => {
            e.preventDefault();

            if (tabName) {
                window.location.href = `${tabName}.html`;
            }
        });
    });
});

