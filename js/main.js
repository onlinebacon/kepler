const { PI, abs, sqrt, sin, cos, acos } = Math;
const TAU = PI*2;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const { width, height } = canvas;
const toRad = (deg) => deg*(PI/180);
const toDeg = (rad) => rad*(180/PI);
const quadratic = (a, b, c) => (sqrt(b*b - 4*a*c) - b)/(2*a);
const segmentArea = (angle) => 0.5*(angle - sin(angle));
const sectorArea = (angle) => abs(angle/2);
const triangleArea = (a, b, c) => {
	const x = (a*a + c*c - b*b)/(2*c);
	const h = sqrt(a*a - x*x);
	return c*h/2;
};

const rad = 170;
const point_rad = 2.5/rad;
const line_width = 1/rad;
const labelSpace = 20/rad;
const fontSize = 14;

ctx.strokeStyle = '#fff';
ctx.fillStyle = '#fff';

const init = 120;
const inc = 0.005;

const drawPoint = ([ x, y ], label) => {
	ctx.beginPath();
	ctx.arc(x, y, point_rad, 0, TAU);
	ctx.fill();
	if (label) {
		const len = sqrt(x*x + y*y);
		const dx = (len ? x/len : 0)*labelSpace;
		const dy = (len ? y/len : 1)*labelSpace;
		x += dx;
		y += dy;
		ctx.font = fontSize/rad + 'px monospace';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(1, -1);
		ctx.fillText(label, 0, 0);
		ctx.restore();
	}
};

const dif = ([ ax, ay ], [ bx, by ]) => [
	ax - bx,
	ay - by,
];

const drawLineSegment = (a, b) => {
	ctx.beginPath();
	ctx.moveTo(...a);
	ctx.lineTo(...b);
	ctx.stroke();
};

const len = ([ x, y ]) => sqrt(x*x + y*y);
const dist = (a, b) => len(dif(a, b));

const c = [ 0, 0 ];
const f = [ -0.5, 0 ];
let theta = toRad(init);

const render = () => {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.fillStyle = '#222';
	ctx.fillRect(0, 0, width, height);

	const [ fx, fy ] = f;

	ctx.setTransform(
		rad, 0,
		0, -rad,
		width/2, height*0.6,
	);

	const a = [ - cos(theta), sin(theta) ];

	const [ ax, ay ] = a;
	const [ dx, dy ] = dif(f, a);

	const t = quadratic(
		dx*dx + dy*dy,
		2*(ax*dx + ay*dy),
		ax*ax + ay*ay - 1,
	);

	const s = [ -1, 0 ];
	const bx = Math.min(1, Math.max(-1, ax + dx*t));
	const by = Math.min(1, Math.max(-1, ay + dy*t));
	const b = [ bx, by ];	

	const sbArc = by >= 0 ? acos(-bx) : TAU - acos(-bx);
	const baArc = (theta - sbArc + 2*TAU)%TAU;
	const bsArc = baArc - theta;

	ctx.fillStyle = 'rgba(0, 192, 255, 0.5)';
	ctx.beginPath();
	ctx.moveTo(...f);
	ctx.lineTo(...a);
	ctx.arc(0, 0, 1, PI - theta, PI);
	ctx.fill();

	ctx.lineWidth = line_width;
	ctx.beginPath();
	ctx.arc(0, 0, 1, 0, Math.PI*2);
	ctx.stroke();

	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(0, 0, 1.04, PI - theta, PI);
	ctx.stroke();

	drawPoint(c, 'C');
	drawPoint(s, 'S');
	drawPoint(f, 'F');
	drawPoint(a, 'A');
	drawPoint(b, 'B');
	drawLineSegment(a, b);
	drawLineSegment(c, s);
	drawLineSegment(c, b);
	drawLineSegment(c, a);

	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.textBaseline = 'top';
	ctx.textAlign = 'left';
	ctx.font = fontSize + 'px monospace';

	let areaBaSeg = segmentArea(baArc);
	let areaBsSec = sectorArea(bsArc);
	let space = 20;
	let cbfArea = triangleArea(len(b), -fx, dist(b, f));
	const info = {
		'arc SB': toDeg(sbArc),
		'arc BA': toDeg(baArc),
		'arc BS': toDeg(bsArc),
		'area of BA segment': areaBaSeg,
		'area of BS sector': areaBsSec,
		'area of CBF triangle': cbfArea,
		'blue area': areaBaSeg + (areaBsSec - cbfArea)*(ay >= 0 ? -1 : 1),
		'test': calcArea(-fx, theta),
	};
	Object.entries(info).forEach(([ label, val ], i) => {
		const l = label + ': ' + Number(val.toPrecision(4));
		ctx.fillText(l, space, (i + 1)*space);
	});
};

const calcArea = (fx, theta) => {
	const [ ax, ay ] = [ - cos(theta), sin(theta) ];
	const dx = - (fx + ax);
	const dy = - ay;
	const t = quadratic(dx*dx + dy*dy, 2*(ax*dx + ay*dy), ax*ax + ay*ay - 1);
	const bx = ax + dx*t;
	const by = ay + dy*t;
	const b = [ bx, by ];
	const sbArc = by >= 0 ? acos(-bx) : TAU - acos(-bx);
	const baArc = (theta - sbArc + 2*TAU)%TAU;
	const bsArc = baArc - theta;
	const areaBaSeg = 0.5*(baArc - sin(baArc));
	const areaBsSec = abs(bsArc/2);
	const cbfArea = triangleArea(len(b), fx, dist(b, [ -fx, 0 ]));
	return areaBaSeg + (areaBsSec - cbfArea)*(ay >= 0 ? -1 : 1);
};

const span = document.querySelector('span');
const input = document.querySelector('input');
const update = () => {
	theta = toRad(input.value);
	render();
	span.innerText = toDeg(theta).toFixed(1) + '°';
};
input.oninput = update;
update();
