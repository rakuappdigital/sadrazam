import Foundation
import Capacitor
import GameKit

@objc(GameCenterPlugin)
public class GameCenterPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GameCenterPlugin"
    public let jsName = "GameCenter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submitScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reportAchievement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showLeaderboard", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showAchievements", returnType: CAPPluginReturnPromise)
    ]

    private let leaderboardID = "years_survived"

    @objc func authenticate(_ call: CAPPluginCall) {
        let localPlayer = GKLocalPlayer.local
        localPlayer.authenticateHandler = { [weak self] viewController, error in
            guard let self = self else { return }
            if let vc = viewController {
                DispatchQueue.main.async {
                    self.bridge?.viewController?.present(vc, animated: true)
                }
                return
            }
            if let error = error {
                call.reject("Game Center authentication failed", nil, error)
                return
            }
            call.resolve(["authenticated": localPlayer.isAuthenticated])
        }
    }

    @objc func submitScore(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Not authenticated")
            return
        }
        let value = call.getInt("value", 0)
        GKLeaderboard.submitScore(value, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [leaderboardID]) { error in
            if let error = error {
                call.reject("Failed to submit score", nil, error)
            } else {
                call.resolve()
            }
        }
    }

    @objc func reportAchievement(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Not authenticated")
            return
        }
        guard let id = call.getString("id") else {
            call.reject("Missing achievement id")
            return
        }
        let percent = call.getDouble("percentComplete") ?? 100.0
        let achievement = GKAchievement(identifier: id)
        achievement.percentComplete = percent
        achievement.showsCompletionBanner = true
        GKAchievement.report([achievement]) { error in
            if let error = error {
                call.reject("Failed to report achievement", nil, error)
            } else {
                call.resolve()
            }
        }
    }

    @objc func showLeaderboard(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Not authenticated")
            return
        }
        DispatchQueue.main.async {
            let vc = GKGameCenterViewController(leaderboardID: self.leaderboardID, playerScope: .global, timeScope: .allTime)
            vc.gameCenterDelegate = self
            self.bridge?.viewController?.present(vc, animated: true)
            call.resolve()
        }
    }

    @objc func showAchievements(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Not authenticated")
            return
        }
        DispatchQueue.main.async {
            let vc = GKGameCenterViewController(state: .achievements)
            vc.gameCenterDelegate = self
            self.bridge?.viewController?.present(vc, animated: true)
            call.resolve()
        }
    }
}

extension GameCenterPlugin: GKGameCenterControllerDelegate {
    public func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}
