-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
local templateActor = game:GetService("ReplicatedStorage"):FindFirstChild("TemplateActor")
if not templateActor then
	error("TemplateActor not found")
end
local WorkerPool
do
	WorkerPool = setmetatable({}, {
		__tostring = function()
			return "WorkerPool"
		end,
	})
	WorkerPool.__index = WorkerPool
	function WorkerPool.new(...)
		local self = setmetatable({}, WorkerPool)
		return self:constructor(...) or self
	end
	function WorkerPool:constructor(renderSettings)
		self.actorPoolIntialized = false
		self.pool = {}
		self.actorAddedBackToPool = Instance.new("BindableEvent")
		self.waitingPool = {}
		self.initializeActors = function(renderSettings)
			if self.actorPoolIntialized then
				return nil
			end
			self.actorPoolIntialized = true
			do
				local i = 0
				local _shouldIncrement = false
				while true do
					if _shouldIncrement then
						i += 1
					else
						_shouldIncrement = true
					end
					if not (i < renderSettings.actorCount) then
						break
					end
					local actor = templateActor:Clone()
					actor.Name = `actor-{i}`
					actor.Parent = game:GetService("ServerScriptService")
					local _exp = self.pool
					table.insert(_exp, actor)
				end
			end
		end
		self.getActor = function(renderSettings)
			if not self.actorPoolIntialized then
				self.initializeActors(renderSettings)
			end
			return TS.Promise.new(function(resolve, reject)
				local actor = table.remove(self.pool, 1)
				if not actor then
					local _waitingPool = self.waitingPool
					local _resolve = resolve
					table.insert(_waitingPool, _resolve)
				else
					resolve(actor)
				end
			end)
		end
		self.cleanupActor = function(actor)
			local _pool = self.pool
			local _actor = actor
			table.insert(_pool, _actor)
			self.actorAddedBackToPool:Fire()
		end
		self.initializeActors(renderSettings)
		self.actorAddedBackToPool.Event:Connect(function()
			local resolve = table.remove(self.waitingPool, 1)
			if resolve then
				local actor = table.remove(self.pool, 1)
				if not actor then
					local _exp = self.waitingPool
					table.insert(_exp, resolve)
					return nil
				end
				resolve(actor)
			end
		end)
	end
end
return {
	WorkerPool = WorkerPool,
}
