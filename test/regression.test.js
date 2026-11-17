// ============================================================================
// AUTOMATED REGRESSION & INTEGRATION TEST SUITE
// Sports HUD AI Studio
// Run with: node test/regression.test.js
// ============================================================================

import assert from 'node:assert/strict';
import { Court, orderCorners, courtLines, applyH, SPORT_CONFIGS } from '../js/court.js';
import { PlayerTracker, interpolateBetween, footPoint, defaultAnchors } from '../js/players.js';
import { StatsTracker, playerMetrics, trailsAt } from '../js/stats.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ FAIL: ${name}`);
    console.error(`    ${err.stack || err.message}`);
    failed++;
  }
}

async function runAll() {
  console.log('\n========================================');
  console.log('SPORTS HUD AI - REGRESSION TEST SUITE');
  console.log('========================================\n');

  // --------------------------------------------------------------------------
  console.log('SUITE 1: Homography & Court Geometry Invariance');
  // --------------------------------------------------------------------------

  test('applyH: handles zero/degenerate projective divisor safely', () => {
    const H = [1, 0, 0, 0, 1, 0, 0, 0, 0]; // w = 0
    const pt = applyH(H, 10, 20);
    assert.strictEqual(pt, null, 'Degenerate w=0 must return null, not throw');
  });

  test('applyH: invariant to arbitrary negative projective scale factor', () => {
    // In projective geometry, [x, y, w] and [-x, -y, -w] represent the same physical point
    const H_pos = [2, 0, 10, 0, 2, 20, 0, 0, 1];
    const H_neg = [-2, 0, -10, 0, -2, -20, 0, 0, -1];
    const p1 = applyH(H_pos, 5, 5);
    const p2 = applyH(H_neg, 5, 5);
    assert.ok(Math.abs(p1[0] - p2[0]) < 1e-6);
    assert.ok(Math.abs(p1[1] - p2[1]) < 1e-6);
  });

  test('Court: virtual court lines are 100% finite numbers for all sports', () => {
    for (const sport of ['badminton', 'pickleball', 'tennis']) {
      const corners = [[100, 100], [600, 100], [680, 500], [20, 500]];
      const court = new Court(corners, 'behind', null, sport);
      const lines = courtLines(sport);
      assert.ok(lines.length > 0, `Sport ${sport} must have lines`);

      for (const [a, b] of lines) {
        for (let k = 0; k <= 10; k++) {
          const t = k / 10;
          const [ix, iy] = court.toImg(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
          assert.ok(Number.isFinite(ix), `Line point x must be finite for ${sport}`);
          assert.ok(Number.isFinite(iy), `Line point y must be finite for ${sport}`);
        }
      }
    }
  });

  test('Court: extreme side-angle perspective (User Video Case) generates valid lines', () => {
    // Extreme side-view corners from actual user clip
    const pts = [[230, 520], [460, 380], [590, 410], [60, 440]];
    const court = new Court(pts, 'behind', 1.2, 'badminton');

    const [tlx, tly] = court.toImg(0, 0);
    const [brx, bry] = court.toImg(6.1, 13.4);
    assert.ok(Number.isFinite(tlx) && Number.isFinite(tly), 'TL corner image coordinates must be finite');
    assert.ok(Number.isFinite(brx) && Number.isFinite(bry), 'BR corner image coordinates must be finite');

    // Round-trip precision test
    const cPt = court.toCourt(tlx, tly);
    assert.ok(Math.abs(cPt[0] - 0) < 1e-3, 'Round-trip court X must match 0');
    assert.ok(Math.abs(cPt[1] - 0) < 1e-3, 'Round-trip court Y must match 0');
  });

  test('Court: inPlay correctly respects sport-specific boundaries and margins', () => {
    const corners = [[0, 0], [10, 0], [10, 20], [0, 20]];
    // Tennis: marginSides 3.5m, marginEnds 6.5m
    const tennis = new Court(corners, 'behind', null, 'tennis');
    assert.ok(tennis.inPlay([tennis.W / 2, tennis.L / 2]), 'Center court is in play');
    assert.ok(tennis.inPlay([tennis.W + 3.0, 10]), 'Tennis 3.0m wide of sideline is in play');
    assert.ok(tennis.inPlay([5, tennis.L + 6.0]), 'Tennis 6.0m behind baseline is in play');
    assert.ok(!tennis.inPlay([5, tennis.L + 8.0]), 'Tennis 8.0m behind baseline is out of play');

    // Badminton: margin 1.2m
    const badminton = new Court(corners, 'behind', null, 'badminton');
    assert.ok(badminton.inPlay([badminton.W + 1.0, 6]), 'Badminton 1.0m wide is in play');
    assert.ok(!badminton.inPlay([badminton.W + 2.0, 6]), 'Badminton 2.0m wide is out of play');
  });

  test('Court: isFar accurately divides the court at the net line', () => {
    const corners = [[0, 0], [10, 0], [10, 20], [0, 20]];
    const court = new Court(corners, 'behind', null, 'badminton');
    assert.strictEqual(court.isFar([3, court.netY - 0.5]), true, 'Point above net is Far court');
    assert.strictEqual(court.isFar([3, court.netY + 0.5]), false, 'Point below net is Near court');
    assert.strictEqual(court.isFar(null), false, 'Null point safely returns false');
  });

  // --------------------------------------------------------------------------
  console.log('\nSUITE 2: Player Detection & Team Assignment');
  // --------------------------------------------------------------------------

  test('Team Assignment: far players are Team A, near players are Team B', () => {
    const corners = [[0, 0], [6.1, 0], [6.1, 13.4], [0, 13.4]];
    const court = new Court(corners, 'behind', null, 'badminton');

    const rawDets = [
      { box: [100, 50, 140, 120], score: 0.9, court: [2.0, 3.0] },  // Far
      { box: [200, 50, 240, 120], score: 0.9, court: [4.0, 3.0] },  // Far
      { box: [100, 250, 140, 320], score: 0.9, court: [2.0, 10.0] }, // Near
      { box: [200, 250, 240, 320], score: 0.9, court: [4.0, 10.0] }, // Near
    ];

    const farDets = rawDets.filter(d => court.isFar(d.court));
    const nearDets = rawDets.filter(d => !court.isFar(d.court));
    assert.strictEqual(farDets.length, 2);
    assert.strictEqual(nearDets.length, 2);

    const players = [
      ...farDets.map(d => ({ ...d, team: court.isFar(d.court) ? 'A' : 'B', side: court.isFar(d.court) ? 'far' : 'near' })),
      ...nearDets.map(d => ({ ...d, team: court.isFar(d.court) ? 'A' : 'B', side: court.isFar(d.court) ? 'far' : 'near' }))
    ];

    assert.strictEqual(players[0].team, 'A');
    assert.strictEqual(players[1].team, 'A');
    assert.strictEqual(players[2].team, 'B');
    assert.strictEqual(players[3].team, 'B');
  });

  test('Team Assignment: Tennis Singles selects 1 Far (Team A) and 1 Near (Team B)', () => {
    const corners = [[0, 0], [10.97, 0], [10.97, 23.77], [0, 23.77]];
    const court = new Court(corners, 'behind', null, 'tennis');

    const farDets = [{ score: 0.95, court: [5.0, 4.0] }];
    const nearDets = [{ score: 0.93, court: [5.0, 19.0] }];

    const isSingles = farDets.length === 1 && nearDets.length === 1;
    assert.strictEqual(isSingles, true);
    const maxPerSide = isSingles ? 1 : 2;

    const chosen = farDets.slice(0, maxPerSide).concat(nearDets.slice(0, maxPerSide));
    assert.strictEqual(chosen.length, 2, 'Singles match must choose exactly 2 players');
    assert.strictEqual(court.isFar(chosen[0].court), true, 'Player 1 is Far / Team A');
    assert.strictEqual(court.isFar(chosen[1].court), false, 'Player 2 is Near / Team B');
  });

  test('Spectator Rejection: out-of-bounds spectator not added to active players', () => {
    const corners = [[0, 0], [6.1, 0], [6.1, 13.4], [0, 13.4]];
    const court = new Court(corners, 'behind', 1.2, 'badminton');

    const realPlayer = { score: 0.9, court: [3.0, 2.5] };
    const spectatorTop = { score: 0.85, court: [3.0, -8.0] }; // Sitting on bleachers 8m back
    const spectatorSide = { score: 0.88, court: [-5.0, 6.7] }; // Sitting in chair 5m to the left

    assert.strictEqual(court.inPlay(realPlayer.court), true);
    assert.strictEqual(court.inPlay(spectatorTop.court), false);
    assert.strictEqual(court.inPlay(spectatorSide.court), false);
  });

  // --------------------------------------------------------------------------
  console.log('\nSUITE 3: Player Tracking, Velocity & Lock-in Continuity');
  // --------------------------------------------------------------------------

  test('PlayerTracker: uninitialized player rejects distant spectators', () => {
    const corners = [[0, 0], [6.1, 0], [6.1, 13.4], [0, 13.4]];
    const court = new Court(corners, 'behind', null, 'badminton');
    const cfg = {
      tracking: { maxSpeed: 7, maxJump: 1.5, lostTtl: 1.0 },
      smoothing: { posAlpha: 0.45, tagAlpha: 0.25 },
      players: [
        { name: 'VĐV 1', color: '#00ff88', team: 'A', side: 'far' },
        { name: 'VĐV 2', color: '#ff0055', team: 'B', side: 'near' }
      ]
    };
    const tracker = new PlayerTracker(cfg, court, 30, { 0: [3.05, 3.0], 1: [3.05, 10.0] });

    // Initial gate must be tight (<= 2.5m for badminton)
    const gate0 = tracker.gate(tracker.players[0], 0);
    assert.ok(gate0 <= 2.5, `Uninitialized gate must be <= 2.5m, got ${gate0}`);

    // Detections: only a spectator at [3.05, -3.0] (6m away from seed [3.05, 3.0])
    const specImg = court.toImg(3.05, -0.5);
    tracker.update([{ tid: 101, box: [specImg[0]-20, specImg[1]-40, specImg[0]+20, specImg[1]], score: 0.9 }], 0);
    assert.strictEqual(tracker.players[0].everSeen, false, 'Spectator 6m away must NOT be locked');
  });

  test('PlayerTracker: same-shirt color does not veto doubles partners', () => {
    const corners = [[0, 0], [6.1, 0], [6.1, 13.4], [0, 13.4]];
    const court = new Court(corners, 'behind', null, 'badminton');
    const sameHist = new Float32Array(16).fill(0.25);
    const cfg = {
      tracking: { maxSpeed: 7, maxJump: 1.5, lostTtl: 1.0 },
      smoothing: { posAlpha: 0.45, tagAlpha: 0.25 },
      players: [
        { name: 'Partner 1', color: '#fff', team: 'A', side: 'far', hist: sameHist },
        { name: 'Partner 2', color: '#fff', team: 'A', side: 'far', hist: sameHist }
      ]
    };
    const tracker = new PlayerTracker(cfg, court, 30);
    const p1 = tracker.players[0];
    const p2 = tracker.players[1];

    // Check distinct shirts
    assert.strictEqual(tracker.hasDistinctShirts(p1), false, 'Identical shirts must report hasDistinctShirts: false');
    assert.strictEqual(tracker.vetoed(p1, { hist: sameHist }), false, 'Veto must be disabled when shirts are identical');
  });

  test('PlayerTracker: velocity prediction maintains momentum during occlusion', () => {
    const corners = [[0, 0], [6.1, 0], [6.1, 13.4], [0, 13.4]];
    const court = new Court(corners, 'behind', null, 'badminton');
    const cfg = {
      tracking: { maxSpeed: 7, maxJump: 1.5, lostTtl: 1.0 },
      smoothing: { posAlpha: 0.45, tagAlpha: 0.25 },
      players: [{ name: 'Sinner', color: '#ffaa00', team: 'A', side: 'far' }]
    };
    const tracker = new PlayerTracker(cfg, court, 30);
    const p = tracker.players[0];
    p.everSeen = true;
    p.pos = [3.0, 3.0];
    p.vel = [2.0, 0.0]; // moving right at 2 m/s
    p.lastSeen = 1.0;

    // After 0.2s of dropout: predicted position should be [3.0 + 2*0.2, 3.0] = [3.4, 3.0]
    const pred = tracker.predPos(p, 1.2);
    assert.ok(Math.abs(pred[0] - 3.4) < 1e-3, 'Velocity prediction along X matches momentum');
    assert.ok(Math.abs(pred[1] - 3.0) < 1e-3, 'Velocity prediction along Y unchanged');
  });

  test('interpolateBetween: smooths pos, seen, show, dist and stamina across stride frames', () => {
    const snaps = [
      {
        t: 0,
        players: [{ idx: 0, pos: [2.0, 2.0], head: [100, 50], show: true, seen: true }],
        dist: [0], sta: [100], staFrac: [1.0]
      },
      {
        t: 0.033,
        players: [{ idx: 0, pos: null, head: null, show: false, seen: false }],
        dist: [0], sta: [100], staFrac: [1.0]
      },
      {
        t: 0.066,
        players: [{ idx: 0, pos: [4.0, 2.0], head: [120, 50], show: true, seen: true }],
        dist: [2.0], sta: [98], staFrac: [0.98]
      }
    ];
    const boxes = [[], [], []];

    interpolateBetween(snaps, boxes, 2);

    const mid = snaps[1].players[0];
    assert.strictEqual(mid.show, true, 'Intermediate frame must retain show: true');
    assert.strictEqual(mid.seen, true, 'Intermediate frame must retain seen: true');
    assert.ok(Math.abs(mid.pos[0] - 3.0) < 1e-3, 'Intermediate position must be linearly interpolated to 3.0');
    assert.ok(Math.abs(snaps[1].dist[0] - 1.0) < 1e-3, 'Intermediate distance must be linearly interpolated to 1.0');
    assert.ok(Math.abs(snaps[1].sta[0] - 99.0) < 1e-3, 'Intermediate stamina must be interpolated to 99.0');
  });

  // --------------------------------------------------------------------------
  console.log('\nSUITE 4: HUD & Stats Consistency');
  // --------------------------------------------------------------------------

  test('playerMetrics: provides valid non-null running metrics even without shuttle rallies', () => {
    const snaps = [
      { t: 0, players: [{ pos: [1.0, 1.0], seen: true }], dist: [0] },
      { t: 0.5, players: [{ pos: [2.0, 1.0], seen: true }], dist: [1.0] },
      { t: 1.0, players: [{ pos: [3.0, 1.0], seen: true }], dist: [2.0] }
    ];

    // Pass null rallies: must compute running distance instead of returning empty nulls
    const metrics = playerMetrics(snaps, null, 30, 7);
    assert.ok(metrics != null, 'Metrics object must not be null');
    assert.strictEqual(snaps[2].rallyM[0], 2.0, 'Rally distance should reflect 2.0m cumulative distance');
  });

  test('trailsAt: generates continuous trail coordinates without intermittent null holes', () => {
    const snaps = [
      { t: 0, players: [{ pos: [1.0, 1.0], seen: true }] },
      { t: 0.1, players: [{ pos: [1.2, 1.0], seen: true }] },
      { t: 0.2, players: [{ pos: [1.4, 1.0], seen: true }] }
    ];
    const trails = trailsAt(snaps, 2, 30, 1.5);
    assert.ok(Array.isArray(trails), 'Trails must be an array');
    const pTrails = trails[0];
    assert.ok(pTrails.length > 0, 'Player trail must have points');
    for (const pt of pTrails) {
      if (pt !== null) {
        assert.ok(Number.isFinite(pt[0]) && Number.isFinite(pt[1]), 'Trail points must be finite numbers');
      }
    }
  });

  // --------------------------------------------------------------------------
  console.log('\nSUITE 5: Defensive Programming & Null Safety');
  // --------------------------------------------------------------------------

  test('Court: toCourt and toImg safely handle non-finite or null inputs', () => {
    const corners = [[0, 0], [6.1, 0], [6.1, 13.4], [0, 13.4]];
    const court = new Court(corners, 'behind', null, 'badminton');

    const cNull = court.toCourt(NaN, Infinity);
    assert.strictEqual(cNull, null, 'toCourt with NaN must safely return null');

    const imgNull = court.toImg(NaN, NaN);
    assert.ok(Number.isNaN(imgNull[0]) && Number.isNaN(imgNull[1]), 'toImg with NaN returns [NaN, NaN]');

    const inPlayNull = court.inPlay(null);
    assert.strictEqual(inPlayNull, false, 'inPlay(null) must safely return false');
  });

  // --------------------------------------------------------------------------
  console.log('\n========================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAll();
