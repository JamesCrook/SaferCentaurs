// This file contains the implementation of new, custom end shapes for biarc connections.

// Crinkle
PathAst.registerEndShape('zig-zag', function(point1, point2, tangentAngle,
  halfWidth, slantAngle) {
  const d = point2.subtract(point1).scale(0.15);
  const midPoint = point1.add(point2).scale(0.5);
  const tangentVector = Vector2D.fromAngle(tangentAngle);

  const p1 = midPoint.add(tangentVector.scale(halfWidth * 0.25)).subtract(
    d);
  const p3 = midPoint.subtract(tangentVector.scale(halfWidth * 0.25)).add(
    d);

  return PathAst.createLinePath([point1, p1, p3, point2]);
});

// Anti-Crinkle
PathAst.registerEndShape('zag-zig', function(point1, point2, tangentAngle,
  halfWidth, slantAngle) {
  const d = point2.subtract(point1).scale(0.15);
  const midPoint = point1.add(point2).scale(0.5);
  const tangentVector = Vector2D.fromAngle(tangentAngle);

  const p1 = midPoint.add(tangentVector.scale(-halfWidth * 0.25)).subtract(
    d);
  const p3 = midPoint.subtract(tangentVector.scale(-halfWidth * 0.25)).add(
    d);

  return PathAst.createLinePath([point1, p1, p3, point2]);
});

PathAst.registerEndShape('bump', function(point1, point2, tangentAngle,
  halfWidth, slantAngle) {
  const d = point2.subtract(point1).scale(0.35).rotate(Math.PI / 2);
  const qPoint = point1.lerp(point2, 0.25);
  const midPoint = point1.lerp(point2, 0.5);
  const tangentVector = Vector2D.fromAngle(tangentAngle);

  const p1 = qPoint.subtract(d);

  return PathAst.createLinePath([point1, p1, midPoint, point2]);
});

PathAst.registerEndShape('anti-bump', function(point1, point2, tangentAngle,
  halfWidth, slantAngle) {
  const d = point2.subtract(point1).scale(0.35).rotate(Math.PI / 2);
  const qPoint = point1.lerp(point2, 0.75);
  const midPoint = point1.lerp(point2, 0.5);
  const tangentVector = Vector2D.fromAngle(tangentAngle);

  const p1 = qPoint.add(d);

  return PathAst.createLinePath([point1, midPoint, p1, point2]);
});

// Zig-Zag
PathAst.registerEndShape('lightning', function(point1, point2, tangentAngle,
  halfWidth, slantAngle) {
  const midPoint = point1.add(point2).scale(0.5);
  const tangentVector = Vector2D.fromAngle(tangentAngle);

  const tip = midPoint.add(tangentVector.scale(halfWidth * 0.25));
  const back = midPoint.subtract(tangentVector.scale(halfWidth * 0.25));

  return PathAst.createLinePath([point1, tip, back, point2]);
});

PathAst.registerEndShape('anti-lightning', function(point1, point2,
  tangentAngle, halfWidth, slantAngle) {
  const midPoint = point1.add(point2).scale(0.5);
  const tangentVector = Vector2D.fromAngle(tangentAngle);

  const tip = midPoint.add(tangentVector.scale(halfWidth * 0.25));
  const back = midPoint.subtract(tangentVector.scale(halfWidth * 0.25));

  return PathAst.createLinePath([point1, back, tip, point2]);
});

// Diamond
PathAst.registerEndShape('diamonds', function(point1, point2, tangentAngle,
  halfWidth, slantAngle) {
  const midPoint = point1.add(point2).scale(0.5);
  const radius = halfWidth;
  const up = Vector2D.fromPolar(radius, tangentAngle + Math.PI / 2);
  const right = Vector2D.fromPolar(radius, tangentAngle + Math.PI);

  const startPoint = midPoint.add(right);
  //const circlePath = PathAst.createArc(startPoint, radius, 0, 2 * Math.PI);
  const p1 = midPoint;
  const p2 = startPoint.add(up);
  const p3 = startPoint.add(right);
  const p4 = startPoint.subtract(up);
  result = PathAst.createLinePath([point1, p1, p2, p3, p4, p1, point2]);
  // We need to fudge the 'M' command to start at the right place for the arc connection
  return result;
});

// Deep in
PathAst.registerEndShape('deep-in', function(point1, point2, tangentAngle,
  halfWidth, slantAngle) {
  const midPoint = point1.add(point2).scale(0.5);
  const tangentVector = Vector2D.fromAngle(tangentAngle);
  const tip = midPoint.add(tangentVector.scale(halfWidth * 3));

  return PathAst.createLinePath([point1, tip, point2]);
});

// Deep Out
PathAst.registerEndShape('deep-out', function(point1, point2, tangentAngle,
  halfWidth, slantAngle) {
  const midPoint = point1.add(point2).scale(0.5);
  const tangentVector = Vector2D.fromAngle(tangentAngle);
  const tip = midPoint.subtract(tangentVector.scale(halfWidth * 3));

  return PathAst.createLinePath([point1, tip, point2]);
});

// Arrow
PathAst.registerEndShape('arrow', function(point1, point2, tangentAngle,
  halfWidth, slantAngle) {
  const midPoint = point1.add(point2).scale(0.5);
  const radius = halfWidth;
  const up = Vector2D.fromPolar(radius * 0.5, tangentAngle + Math.PI / 2);
  const right = Vector2D.fromPolar(radius, tangentAngle);

  const startPoint = midPoint.add(right);
  //const circlePath = PathAst.createArc(startPoint, radius, 0, 2 * Math.PI);
  const p1 = midPoint;
  const p2 = point1.add(up).add(right.scale(0.3));
  const p3 = midPoint.add(right.scale(-3));
  const p4 = point2.subtract(up).add(right.scale(0.3));
  result = PathAst.createLinePath([point1, p2, p3, p4, point2]);
  return result;
});

/*
// Flat
PathAst.registerEndShape('dud1', function(point1, point2, tangentAngle, halfWidth, slantAngle) {
  return PathAst.createLinePath([point1, point2]);
});

// Flatish
PathAst.registerEndShape('dud2', function(point1, point2, tangentAngle, halfWidth, slantAngle) {
  const midPoint = point1.add(point2).scale(0.5);
  const tangentVector = Vector2D.fromAngle(tangentAngle);
  const perpendicular = tangentVector.perpendicular();

  const p1 = midPoint.add(perpendicular.scale(halfWidth));
  const p2 = midPoint.subtract(perpendicular.scale(halfWidth));
  const p3 = midPoint.subtract(tangentVector.scale(halfWidth*2));

  const path = PathAst.createLinePath([p1, p2]);
  const moveTo = PathAst.createPathCommand('M', midPoint.x, midPoint.y);
  const lineTo = PathAst.createPathCommand('L', p3.x, p3.y);
  path.subtree.push({token: "pathCommand", subtree: [moveTo.subtree[0], moveTo.subtree[1], moveTo.subtree[2]]});
  path.subtree.push({token: "pathCommand", subtree: [lineTo.subtree[0], lineTo.subtree[1], lineTo.subtree[2]]});
  return path;
});

// Skewed
PathAst.registerEndShape('dud3', function(point1, point2, tangentAngle, halfWidth, slantAngle) {
  const tangentVector = Vector2D.fromAngle(tangentAngle);
  const perpendicular = tangentVector.perpendicular();
  const offset = perpendicular.scale(halfWidth * 0.5);

  const p1a = point1.add(offset);
  const p2a = point2.add(offset);
  const p1b = point1.subtract(offset);
  const p2b = point2.subtract(offset);

  const path = PathAst.createLinePath([p1a, p2a]);
  const moveTo = PathAst.createPathCommand('M', p1b.x, p1b.y);
  const lineTo = PathAst.createPathCommand('L', p2b.x, p2b.y);
  path.subtree.push({token: "pathCommand", subtree: [moveTo.subtree[0], moveTo.subtree[1], moveTo.subtree[2]]});
  path.subtree.push({token: "pathCommand", subtree: [lineTo.subtree[0], lineTo.subtree[1], lineTo.subtree[2]]});
  return path;
});

*/
