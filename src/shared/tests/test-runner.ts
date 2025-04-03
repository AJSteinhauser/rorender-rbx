import TestEZ from "@rbxts/testez"

export const runTests = () => {
    const pluginRef = script.FindFirstAncestor("rorender/plugin")
    if (!pluginRef) {
        warn("Test were unable to execute")
        return
    }

    TestEZ.TestBootstrap.run([pluginRef], TestEZ.Reporters.TextReporter)
}
