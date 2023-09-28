import React, { useEffect } from 'react';
import { ApolloProvider, useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
	uri: "https://bitcash-apollo-dev-ymrgicuyta-uc.a.run.app/graphql", // Replace with your GraphQL server URI
	cache: new InMemoryCache(),
});

const SEND_NOTIFICATION = gql`
  mutation {
    send_push_notification
  }
`;

const SUBSCRIBE_TO_NOTIFICATIONS = gql`
  mutation SubscribeToNotifications($subscription: PushSubscriptionInput!) {
    subscribe_push_notification(subscription: $subscription)
  }
`;

const NotificationButton: React.FC = () => {
	const [sendNotification, { error }] = useMutation(SEND_NOTIFICATION);

	useEffect(() => {
		if (error) {
			console.error("GraphQL Error:", error);
		}
	}, [error]);

	return (
		<button onClick={async () => {
			try {
				const { data } = await sendNotification();
				console.log("Notification sent:", data);
			} catch (e) {
				console.error("Failed to send notification:", e);
			}
		}}>
			Send Notification
		</button>
	);
};

const SubscribeButton: React.FC = () => {
	const [subscribeToNotificationsGQL] = useMutation(SUBSCRIBE_TO_NOTIFICATIONS);

	const subscribeToNotifications = async () => {
		try {

			Notification.requestPermission().then(function (permission) { console.log('permiss', permission) });

			const permission = await Notification.requestPermission();

			if (permission !== 'granted') {
				console.log('Notifications not granted');
				return;
			}

			const swRegistration = await navigator.serviceWorker.ready;
			const subscription = await swRegistration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: 'BFnE-4tKzIaTYVM1RlD2NPrG1oZ4XKQRwelDUEH7TfNf5GDOwS1LAR3HceN8F5MN619LqJxfk9BxUEdtKi1wLjc'
			});

			await subscribeToNotificationsGQL({
				variables: { subscription: subscription }
			});

			console.log('Successfully subscribed to notifications:', subscription);
		} catch (e) {
			console.error('Failed to subscribe for notifications:', e);
		}
	};

	return (
		<button onClick={subscribeToNotifications}>
			Subscribe to Notifications
		</button>
	);
};

const App: React.FC = () => {
	useEffect(() => {
		// Initialize service worker
		if ('serviceWorker' in navigator && 'PushManager' in window) {
			navigator.serviceWorker.register('/service-worker.js').then(registration => {
				// An update is found
				registration.onupdatefound = () => {
					const installingWorker = registration.installing;
					if (installingWorker) {
						installingWorker.onstatechange = () => {
							if (installingWorker.state === 'installed') {
								if (navigator.serviceWorker.controller) {
									// New content is available and will be used when all
									// tabs for this page are closed.
									console.log('New content is available; please refresh.');
								} else {
									// Content is cached, and will be available for offline use.
									console.log('Content is now available offline!');
								}
							}
						};
					}
				};
			}).catch(error => {
				console.log('Error during service worker registration:', error);
			});
		}
	}, []);
	return (
		<ApolloProvider client={client}>
			<div className="App">
				<SubscribeButton />
				<NotificationButton />
			</div>
		</ApolloProvider>
	);
};

export default App;
