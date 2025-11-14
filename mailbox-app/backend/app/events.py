import asyncio
from collections import defaultdict

class EventHub:
    def __init__(self):
        self.channels = defaultdict(list)
        self.lock = asyncio.Lock()

    async def subscribe(self, key: str):
        q = asyncio.Queue()
        async with self.lock:
            self.channels[key].append(q)
        return q

    async def unsubscribe(self, key: str, q):
        async with self.lock:
            if q in self.channels.get(key, []):
                self.channels[key].remove(q)

    async def publish(self, key: str, data: dict):
        async with self.lock:
            for q in list(self.channels.get(key, [])):
                await q.put(data)

hub = EventHub()
