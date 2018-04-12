import { Comment } from './models/comment';
}

export function mapCommentsToHead(patches: string, comments: Comment[]) {
	let regex = new RegExp(DIFF_HUNK_INFO, 'g');
	let matches = regex.exec(patches);

	let rangeMapping = [];
	const diffHunkContext = 3;
	while (matches) {
		let oriStartLine = Number(matches[1]);
		let oriLen = Number(matches[3]) | 0;
		let newStartLine = Number(matches[5]);
		let newLen = Number(matches[7]) | 0;

		rangeMapping.push({
			oriStart: oriStartLine + diffHunkContext,
			oriLen: oriLen - diffHunkContext * 2,
			newStart: newStartLine + diffHunkContext,
			newLen: newLen - diffHunkContext * 2
		});
		matches = regex.exec(patches);
	}

	for (let i = 0; i < comments.length; i++) {
		let comment = comments[i];
		let commentPosition = comment.diff_hunk_range.start + comment.position - 1;
		let delta = 0;
		for (let j = 0; j < rangeMapping.length; j++) {
			let map = rangeMapping[j];
			if (map.oriStart + map.oriLen - 1 < commentPosition) {
				delta += map.newLen - map.oriLen;
			} else if (map.oriStart > commentPosition) {
				continue;
			} else {
				break;
			}
		}

		comment.currentPosition = commentPosition + delta;
	}

	return comments;