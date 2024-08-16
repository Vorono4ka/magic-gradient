Number.prototype.hex = function () {
    return this.toString(16).padStart(2, '0');
};

class Frame {
    /**
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {boolean} checkBorders
     */
    constructor(r=0, g=0, b=0, checkBorders=true) {
        if (checkBorders) {
            if (r > 255) {
                r = 255;
            } else if (r < 0) {
                r = 0;
            }

            if (g > 255) {
                g = 255;
            } else if (g < 0) {
                g = 0;
            }

            if (b > 255) {
                b = 255;
            } else if (b < 0) {
                b = 0;
            }
        }

        this.r = r;
        this.g = g;
        this.b = b;
    }

    /**
     * @param {Frame} otherFrame
     */
    difference(otherFrame) {
        let r = this.r - otherFrame.r;
        let g = this.g - otherFrame.g;
        let b = this.b - otherFrame.b;

        return new Frame(r, g, b, false);
    }

    /**
     * @param {Frame} otherFrame
     */
    add(otherFrame) {
        let r = this.r + otherFrame.r;
        let g = this.g + otherFrame.g;
        let b = this.b + otherFrame.b;

        return new Frame(r, g, b);
    }

    /**
     * @param {number} scale
     */
    mul(scale) {
        let r = parseInt(this.r * scale);
        let g = parseInt(this.g * scale);
        let b = parseInt(this.b * scale);

        return new Frame(r, g, b, false);
    }

    toString() {
        return this.r.hex() + this.g.hex() + this.b.hex();
    }

    /**
     * @param {Frame[]} frames
     */
    static max(frames) {
        let maxFrame = null;
        for (const frame of frames) {
            if (maxFrame === null ||
                (frame.r + frame.g + frame.b >= maxFrame.r + maxFrame.g + maxFrame.b)) {
                maxFrame = frame;
            }
        }

        return maxFrame;
    }

    /**
     * @param {Frame[]} frames
     */
    static min(frames) {
        let minFrame = null;
        for (const frame of frames) {
            if (minFrame === null ||
                (frame.r + frame.g + frame.b < minFrame.r + minFrame.g + minFrame.b)) {
                minFrame = frame;
            }
        }

        return minFrame;
    }
}

class Gradient {
    constructor() {
        this.frames = [];
    }

    /**
     * @param {string} color
     */
    createFrame(color) {
        let r = parseInt(color.slice(0, 2), 16);
        let g = parseInt(color.slice(2, 4), 16);
        let b = parseInt(color.slice(4, 6), 16);

        this.frames.push(new Frame(r, g, b));
    }

    /**
     * @param {number} length
     */
    smooth(length) {
        let framesCount = this.frames.length;

        if (framesCount >= length) return this.frames.slice(0, length);

        if (framesCount > 1) {
            let smoothed = [];

            let transitionsCount = framesCount;
            let framesInTransition = Math.ceil(length/(transitionsCount-1));
            for (let transitionIndex = 0; transitionIndex < transitionsCount; transitionIndex++) {
                let frameSlice = this.frames.slice(transitionIndex, transitionIndex + 2);
                let minFrame = Frame.min(frameSlice);
                let maxFrame = Frame.max(frameSlice);

                let difference = maxFrame.difference(minFrame);

                let frameToAdd = minFrame;
                for (let x = 0; x < framesInTransition; x++) {
                    let transitionLevel = x / (framesInTransition - 1) || 0;
                    if (frameSlice.indexOf(minFrame) === 1) {
                        frameToAdd = maxFrame;
                        transitionLevel *= -1;
                    }
                    smoothed.push(frameToAdd.add(difference.mul(transitionLevel)));
                }
            }
            return smoothed;
        }

        return this.frames;
    }

    /**
     * @param {string} text
     * @param {number} style
     */
    apply(text, style = 0) {
        if (text.length === 0) return '';
        let result = '';

        const frames = this.smooth(text.length);
        for (let charIndex = 0; charIndex < text.length; charIndex++) {
            let frame = frames[charIndex % frames.length];
            if (style === 0)
                result += `<c${frame.toString()}>${text[charIndex]}`;
            else if (style === 1)
                result += `<font color="#${frame.toString()}">${text[charIndex]}</font>`;

        }
        if (style === 0)
            result += '</c>';

        return result;
    }
}

let onRemoveColor = function (event) {
    let colorGroup = event.target.parentElement;

    if (document.getElementById('colors').childElementCount > 1)
        colorGroup.remove();
    else {
        let toast = new bootstrap.Toast(document.querySelector('#error-toast'));
        toast.show();
    }

    onChangeSettings();
};

function onChangeSettings() {
    const gradient = new Gradient();

    const text = document.getElementById('inputMessage').value;

    for (const colorGroup of document.getElementById('colors').children) {
        let colorInput = colorGroup.getElementsByTagName('input')[0];
        gradient.createFrame(colorInput.value.slice(1));
    }
    document.getElementById('result').value = gradient.apply(text);
    document.getElementById('preview').innerHTML = gradient.apply(text, 1);
}

function addColorInput() {
    const color = document.createElement('div');
    color.classList.add('input-group');

    const colorInput = document.createElement('input');
    colorInput.setAttribute('aria-describedby', 'remove-button');
    colorInput.classList.add('form-control-color');
    colorInput.classList.add('form-control');
    colorInput.style.maxWidth = '100%';
    colorInput.type = 'color';

    const closeBtn = document.createElement('button');
    closeBtn.classList.add('btn-outline-danger');
    closeBtn.classList.add('btn');
	closeBtn.innerHTML = '❌';

    colorInput.onchange = onChangeSettings;
    closeBtn.onclick = onRemoveColor;

    color.appendChild(colorInput);
    color.appendChild(closeBtn);

    document.getElementById('colors').appendChild(color);
    onChangeSettings();
}

function init() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[tooltip]'));
    tooltipTriggerList.map(function (element) {
        let tooltip = new bootstrap.Tooltip(element);

        element.setAttribute('data-bs-original-title', element.getAttribute('tooltip'));
        element.addEventListener('mouseout', function (event) {
            let element = event.target;
            element.setAttribute('data-bs-original-title', element.getAttribute('tooltip'));
        });

        return tooltip;
    });

    document.querySelector('#copy-button').addEventListener('click', function (event) {
        let inputToCopy = document.querySelector('#result');

        inputToCopy.select();
        inputToCopy.setSelectionRange(0, 99999);

        document.execCommand("copy");

        let button = event.target;
        button.setAttribute('data-bs-original-title', 'Copied!');
        let tooltip = bootstrap.Tooltip.getInstance(button);
        tooltip.show();
    })

    addColorInput();
}
