const convertIndexCol = (i: number, j: number): string => {
	return 'col' + (i * 3 + j).toString();
};

export default convertIndexCol;
