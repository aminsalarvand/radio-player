// Radio Lahze — Experimental Mood Decision Engine

const engine = {
    clamp(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return 0;
        }

        return Math.max(0, Math.min(100, number));
    },

    decideMood({ happiness, sadness, calmness, stress }) {
        // Normalize all inputs to the 0–100 range
        happiness = this.clamp(happiness);
        sadness = this.clamp(sadness);
        calmness = this.clamp(calmness);
        stress = this.clamp(stress);

        // Calculate the four competing scores
        const scores = {
            happy: happiness * (100 - sadness),
            sad: sadness * (100 - happiness),
            relax: calmness * (100 - stress),
            anxious: stress * (100 - calmness)
        };

        const labels = {
            happy: "Happy",
            sad: "Sad",
            relax: "Relax",
            anxious: "Anxious"
        };

        const maxScore = Math.max(...Object.values(scores));

        const winners = Object.keys(scores).filter(
            mood => scores[mood] === maxScore
        );

        return {
            mood: winners[0],
            label: labels[winners[0]],
            scores,
            tie: winners.length > 1,
            tiedMoods: winners.length > 1 ? winners : []
        };
    }
};

window.engine = engine;

// Glass Mode panel controls
document.addEventListener("DOMContentLoaded", () => {
    const modeTrigger = document.getElementById("modeTrigger");
    const modeOverlay = document.getElementById("modeOverlay");
    const closePanel = document.getElementById("closePanel");

    if (!modeTrigger || !modeOverlay || !closePanel) return;

    function openModePanel() {
        modeOverlay.hidden = false;
        modeTrigger.setAttribute("aria-expanded", "true");
    }

    function closeModePanel() {
        modeOverlay.hidden = true;
        modeTrigger.setAttribute("aria-expanded", "false");
    }

    modeTrigger.addEventListener("click", openModePanel);
    closePanel.addEventListener("click", closeModePanel);

    modeOverlay.addEventListener("click", (event) => {
        if (event.target === modeOverlay) {
            closeModePanel();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modeOverlay.hidden) {
            closeModePanel();
        }
    });

    document.querySelectorAll(".slider-card input").forEach((slider) => {
        const output = slider.closest(".slider-card").querySelector("output");

        slider.addEventListener("input", () => {
            output.value = `${slider.value}%`;
            output.textContent = `${slider.value}%`;
        });
    });
    // Connect the four sliders to the existing decision formula
const sliderInputs = document.querySelectorAll(".slider-card input");
const stateResult = document.getElementById("glassStateResult");
const stateScores = document.getElementById("glassStateScores");

function updateGlassState() {
    const [happiness, sadness, calmness, stress] =
        Array.from(sliderInputs).map(input => Number(input.value));

    const result = window.engine.decideMood({
        happiness,
        sadness,
        calmness,
        stress
    });

    if (stateResult) {
        const isEconomy =
            document.getElementById("trafficModeLabel")
                ?.textContent.trim() === "Economy";

        const economyLabels = {
            happy: "Khoshal",
            sad: "Narahat",
            relax: "Khonsa",
            anxious: "Moztareb"
        };

        stateResult.textContent = isEconomy
            ? economyLabels[result.mood] || result.label
            : result.label;
    }

    if (stateScores) {
        const isEconomy =
            document.getElementById("trafficModeLabel")
                ?.textContent.trim() === "Economy";

        const labels = isEconomy
            ? {
                happy: "Khoshal",
                sad: "Narahat",
                relax: "Khonsa",
                anxious: "Moztareb"
            }
            : {
                happy: "Happy",
                sad: "Sad",
                relax: "Calm",
                anxious: "Anxious"
            };

        stateScores.textContent =
            `${labels.happy}: ${result.scores.happy} | ` +
            `${labels.sad}: ${result.scores.sad} | ` +
            `${labels.relax}: ${result.scores.relax} | ` +
            `${labels.anxious}: ${result.scores.anxious}`;
    }
}

    // Update the result whenever a slider moves
    sliderInputs.forEach(input => {
        input.addEventListener("input", updateGlassState);
    });

    // Calculate the initial result
    updateGlassState();
});