self.addEventListener("activate", (event) => {
	console.log("service worker activated");
});

self.addEventListener("push", async (event) => {
	console.log("Push event received:", event);
	if (event.data) {
		const rawData = event.data.json();
		console.log("Push event data:", rawData); // Debugging line

		const notificationData = rawData.notification;

		if (notificationData) {
			const { title, body, icon } = notificationData;
			const options = {
				body,
				icon,
			};
			console.log("About to show the notification", { title, options }); // Debugging line
			await event.waitUntil(self.registration.showNotification("Title", options));
		} else {
			console.log("No notification data found");
		}
	} else {
		console.log("This push event has no data.");
	}
});
