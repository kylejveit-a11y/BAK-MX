// Siri, Spotlight, Shortcuts and the Action button: "Ask BAK MX", "Snap a part for BAK MX",
// "Log a setup change in BAK MX", "What's due on my bike in BAK MX".
// Each action opens the app and leaves the request in UserDefaults; the JavaScript side picks it up
// (React Native's Settings module) and opens the right screen. Nothing here talks to the network.
import AppIntents
import Foundation

@available(iOS 17.0, *)
enum BakIntentLink {
  static let key = "bak.pendingLink"

  static func leave(_ host: String, _ items: [URLQueryItem] = []) {
    var parts = URLComponents()
    parts.scheme = "bakmx"
    parts.host = host
    if !items.isEmpty { parts.queryItems = items }
    guard let url = parts.url?.absoluteString else { return }
    let payload: [String: Any] = ["url": url, "at": Date().timeIntervalSince1970 * 1000]
    guard let data = try? JSONSerialization.data(withJSONObject: payload),
          let text = String(data: data, encoding: .utf8) else { return }
    UserDefaults.standard.set(text, forKey: key)
  }
}

@available(iOS 17.0, *)
struct AskBakIntent: AppIntent {
  static let title: LocalizedStringResource = "Ask BAK"
  static let openAppWhenRun: Bool = true

  @Parameter(title: "Question", requestValueDialog: IntentDialog("What do you want to ask BAK?"))
  var question: String

  @MainActor
  func perform() async throws -> some IntentResult {
    BakIntentLink.leave("ask", [URLQueryItem(name: "q", value: question)])
    return .result()
  }
}

@available(iOS 17.0, *)
struct SnapPartIntent: AppIntent {
  static let title: LocalizedStringResource = "Snap a Part for BAK"
  static let openAppWhenRun: Bool = true

  @MainActor
  func perform() async throws -> some IntentResult {
    BakIntentLink.leave("snap")
    return .result()
  }
}

@available(iOS 17.0, *)
struct LogSetupChangeIntent: AppIntent {
  static let title: LocalizedStringResource = "Log a Setup Change"
  static let openAppWhenRun: Bool = true

  @Parameter(title: "Change", requestValueDialog: IntentDialog("What did you change?"))
  var change: String

  @MainActor
  func perform() async throws -> some IntentResult {
    BakIntentLink.leave("setup", [URLQueryItem(name: "note", value: change)])
    return .result()
  }
}

@available(iOS 17.0, *)
struct ServiceDueIntent: AppIntent {
  static let title: LocalizedStringResource = "Service Log"
  static let openAppWhenRun: Bool = true

  @MainActor
  func perform() async throws -> some IntentResult {
    BakIntentLink.leave("service")
    return .result()
  }
}

@available(iOS 17.0, *)
struct BakShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: AskBakIntent(),
      phrases: [
        "Ask \(.applicationName)",
        "Ask \(.applicationName) a question",
        "Ask \(.applicationName) about my bike",
      ],
      shortTitle: "Ask BAK",
      systemImageName: "bubble.left.and.text.bubble.right"
    )
    AppShortcut(
      intent: SnapPartIntent(),
      phrases: [
        "Snap a part for \(.applicationName)",
        "Show \(.applicationName) a part",
        "Take a photo for \(.applicationName)",
      ],
      shortTitle: "Snap a Part",
      systemImageName: "camera.viewfinder"
    )
    AppShortcut(
      intent: LogSetupChangeIntent(),
      phrases: [
        "Log a setup change in \(.applicationName)",
        "Log a change in \(.applicationName)",
        "Add to my setup log in \(.applicationName)",
      ],
      shortTitle: "Log Setup Change",
      systemImageName: "slider.horizontal.3"
    )
    AppShortcut(
      intent: ServiceDueIntent(),
      phrases: [
        "What's due on my bike in \(.applicationName)",
        "Open my service log in \(.applicationName)",
        "Show my \(.applicationName) service log",
      ],
      shortTitle: "Service Log",
      systemImageName: "wrench.and.screwdriver"
    )
  }
}
