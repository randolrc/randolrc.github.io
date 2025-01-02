
    $(document).ready(function () {
        const texts = [
            "This is the first paragraph. It will be displayed letter by letter with a fade-in effect.",
            "Here is the second paragraph. You can use the arrows to navigate between them.",
            "And this is the third paragraph. Each paragraph is displayed dynamically."
        ];

        let currentTextIndex = 0;
        const delay = 250; // 0.25 seconds
        const $display = $("#display");
        const $indicator = $("#indicator");

        /**
         * Measures the pixel width of a given word based on the current font style of the display container.
         * @param {string} word - The word to measure.
         * @returns {number} - The pixel width of the word.
         */
        function measureWordWidth(word) {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            // Set the font style to match the container's computed font style
            const computedStyle = window.getComputedStyle($display[0]);
            context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

            return context.measureText(word).width;
        }

        /**
         * Wraps text to fit within the container's width by measuring the pixel width of each word.
         * @param {string} text - The input text to wrap.
         * @returns {string} - The wrapped text with newlines inserted.
         */
        function wrapText(text) {
            const containerWidth = $display[0].offsetWidth; // Get container width in pixels
            const words = text.split(" ");
            let line = "";
            let wrappedText = "";

            words.forEach(word => {
                const wordWidth = measureWordWidth(word);
                const lineWidth = measureWordWidth(line);

                if (lineWidth + wordWidth > containerWidth) {
                    wrappedText += line.trim() + "\n"; // Add the current line and start a new one
                    line = "";
                }

                line += word + " ";
            });

            wrappedText += line.trim(); // Add the last line
            return wrappedText;
        }

        function displayText(text) {
            $display.empty(); // Clear existing content
            let wrappedText = wrapText(text);
            let index = 0;

            function displayNextLetter() {
                if (index < wrappedText.length) {
                    let letter = wrappedText[index] === '\n' ? "<br>" : wrappedText[index];
                    let $letterSpan = $("<span>").html(letter).addClass("fade-in");
                    $display.append($letterSpan);
                    index++;
                    setTimeout(displayNextLetter, delay);
                }
            }

            displayNextLetter();
        }

        function updateIndicator() {
            $indicator.val(currentTextIndex + 1); // Display 1-based index
        }

        function goToParagraph(index) {
            if (index >= 0 && index < texts.length) {
                currentTextIndex = index;
                displayText(texts[currentTextIndex]);
                updateIndicator();
            }
        }

        // Event listeners for arrow buttons
        $("#prev").click(function () {
            if (currentTextIndex > 0) {
                goToParagraph(currentTextIndex - 1);
            }
        });

        $("#next").click(function () {
            if (currentTextIndex < texts.length - 1) {
                goToParagraph(currentTextIndex + 1);
            }
        });

        // Handle Enter key for indicator input
        $indicator.on("keypress", function (event) {
            if (event.key === "Enter") {
                const inputValue = parseInt($indicator.val(), 10) - 1; // Convert to 0-based index
                if (!isNaN(inputValue)) {
                    goToParagraph(inputValue);
                }
            }
        });

        // Initialize
        displayText(texts[currentTextIndex]);
        updateIndicator();
    });

