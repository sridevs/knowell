const assert = require('assert');
let manipulator = require('../../../../api/lib/searchTextManipulator');

describe('SearchTextManipulator', () => {
	it('should add escape charector before each letter', () => {
		let searchText = 'my book';
		let expected = '\\m\\y\\ \\b\\o\\o\\k';
		let actual = manipulator.manipulate(searchText);
		assert.equal(expected, actual);
	});

	it('should remove extra spaces from text', () => {
		let searchText = 'my    lovely  book  ';
		let expected = '\\m\\y\\ \\l\\o\\v\\e\\l\\y\\ \\b\\o\\o\\k';
		let actual = manipulator.manipulate(searchText);
		assert.equal(expected, actual);
	});

	it('should trim the given text', () => {
		let searchText = '        ';
		let expected = '\\';
		let actual = manipulator.manipulate(searchText);
		assert.equal(expected, actual);
	})
})