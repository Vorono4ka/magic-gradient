let onRemoveColor = function (event) {
    let colorGroup = event.target.parentElement;

    if (document.getElementById('colors').childElementCount > 1)
        colorGroup.remove();
    else {
        let toast = new Toast(document.querySelector('#error-toast'));
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
    colorInput.style.maxWidth = '100%';
    colorInput.type = 'color';

    const closeBtn = document.createElement('button');
	closeBtn.innerHTML = '❌';

    colorInput.onchange = onChangeSettings;
    closeBtn.onclick = onRemoveColor;

    color.appendChild(colorInput);
    color.appendChild(closeBtn);

    document.getElementById('colors').appendChild(color);
    onChangeSettings();
}

function init() {
    document.querySelector('#copy-button').addEventListener('click', function (event) {
        let inputToCopy = document.querySelector('#result');

        inputToCopy.select();
        inputToCopy.setSelectionRange(0, 99999);

        document.execCommand("copy");

        let button = event.target;
        button.setAttribute('data-bs-original-title', 'Copied!');
    })

    addColorInput();
}