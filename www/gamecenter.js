// gamecenter.js — Apple Game Center entegrasyonu (native, iOS)
// Web/Android'de no-op — Capacitor plugin yoksa tüm çağrılar sessizce yutulur.

const GameCenter = (() => {
  let _cap = null;
  if (window.Capacitor?.isNativePlatform?.()) {
    try { _cap = window.Capacitor.Plugins.GameCenter; } catch (e) {}
  }

  let _authenticated = false;

  const authenticate = () => {
    if (!_cap) return;
    _cap.authenticate()
      .then(res => { _authenticated = !!res?.authenticated; })
      .catch(() => {});
  };

  const submitScore = (years) => {
    if (!_cap || !_authenticated) return;
    _cap.submitScore({ value: years }).catch(() => {});
  };

  const reportAchievement = (id, percentComplete = 100) => {
    if (!_cap || !_authenticated) return;
    _cap.reportAchievement({ id, percentComplete }).catch(() => {});
  };

  const showLeaderboard = () => {
    if (!_cap || !_authenticated) return;
    _cap.showLeaderboard().catch(() => {});
  };

  const showAchievements = () => {
    if (!_cap || !_authenticated) return;
    _cap.showAchievements().catch(() => {});
  };

  return { authenticate, submitScore, reportAchievement, showLeaderboard, showAchievements };
})();

GameCenter.authenticate();
