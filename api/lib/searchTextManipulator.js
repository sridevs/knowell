const replaceExtraSpace = (text) => {
	return text.replace(/\s+/g, ' ');
}

const addEscapeCharBeforeLetters = (text) => {
	return `\\${text.split('').join('\\')}`; 
}

const manipulate = (text) => {
	text = replaceExtraSpace(text.trim());
	return addEscapeCharBeforeLetters(text)
}

module.exports = {
	manipulate: manipulate
}