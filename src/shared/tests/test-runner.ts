import TestEZ from "@rbxts/testez";


export const runTests = () => {
    TestEZ.TestBootstrap.run([(game.GetService("ReplicatedStorage") as Instance)], TestEZ.Reporters.TextReporter)
}





