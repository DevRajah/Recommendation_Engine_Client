import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./index.css";

// Use your deployed backend URL here.
// For local testing, use: http://localhost:5800
const API_URL = "http://localhost:5800";
//https://recommendation-engine-jfdd.onrender.com";

const actions = ["view", "like", "comment", "share"];


function App() {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [debugData, setDebugData] = useState(null);

  const [socketStatus, setSocketStatus] = useState("Disconnected");
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedUser = useMemo(() => {
    return users.find((user) => user._id === selectedUserId);
  }, [users, selectedUserId]);

  // This loads the users and items when the page first opens.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        setErrorMessage("");

        const [usersResponse, itemsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/users`),
          axios.get(`${API_URL}/api/items`)
        ]);

        const fetchedUsers = usersResponse.data.data || [];
        const fetchedItems = itemsResponse.data.data || [];

        setUsers(fetchedUsers);
        setItems(fetchedItems);

        if (fetchedUsers.length) {
          setSelectedUserId(fetchedUsers[0]._id);
        }
      } catch (error) {
        setErrorMessage(
          "Unable to load users/items. The backend may still be waking up on Render, or the API URL may be incorrect."
        );
        console.error("Failed to load initial data:", error.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // This loads recommendations, analytics, and debug data whenever the selected user changes.
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchUserData = async () => {
      try {
        setUserDataLoading(true);
        setErrorMessage("");

        const [
          recommendationsResponse,
          analyticsResponse,
          debugResponse
        ] = await Promise.all([
          axios.get(`${API_URL}/api/recommendations/${selectedUserId}`),
          axios.get(`${API_URL}/api/users/${selectedUserId}/analytics`),
          axios.get(`${API_URL}/api/recommendations/${selectedUserId}/debug`)
        ]);

        setRecommendations(recommendationsResponse.data.data || []);
        setAnalytics(analyticsResponse.data.data || null);
        setDebugData(debugResponse.data.data || null);
      } catch (error) {
        setErrorMessage(
          "Unable to load recommendation data. Please check the backend URL or wait for Render to wake up."
        );
        console.error("Failed to load user data:", error.message);
      } finally {
        setUserDataLoading(false);
      }
    };

    fetchUserData();
  }, [selectedUserId]);

  // This connects the frontend to Socket.io for live recommendation updates.
  useEffect(() => {
    if (!selectedUserId) return;

    const socket = io(API_URL, {
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      setSocketStatus("Connected");
      socket.emit("join:user", selectedUserId);
    });

    socket.on("recommendations:updated", (payload) => {
      if (payload.userId === selectedUserId) {
        setRecommendations(payload.recommendations || []);
        setLastLiveUpdate(new Date().toLocaleTimeString());
      }
    });

    socket.on("disconnect", () => {
      setSocketStatus("Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedUserId]);

  const refreshUserData = async () => {
    if (!selectedUserId) return;

    const [analyticsResponse, debugResponse] = await Promise.all([
      axios.get(`${API_URL}/api/users/${selectedUserId}/analytics`),
      axios.get(`${API_URL}/api/recommendations/${selectedUserId}/debug`)
    ]);

    setAnalytics(analyticsResponse.data.data || null);
    setDebugData(debugResponse.data.data || null);
  };

  // This creates a new interaction, then refreshes analytics/debug data.
  const handleInteraction = async (itemId, action) => {
    if (!selectedUserId) return;

    try {
      setLoadingAction(true);
      setErrorMessage("");

      const response = await axios.post(`${API_URL}/api/interactions`, {
        userId: selectedUserId,
        itemId,
        action
      });

      setRecommendations(response.data.recommendations || []);
      await refreshUserData();
    } catch (error) {
      setErrorMessage(
        "Unable to create interaction. The backend may be sleeping or the request failed."
      );
      console.error("Failed to create interaction:", error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm text-blue-300">Real-Time Recommendation Engine</p>
          <h1 className="mt-2 text-4xl font-bold">
            Recommendation Engine Demo
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Select a demo user, interact with items, and watch recommendations
            update in real time through Socket.io.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-red-200">
            {errorMessage}
          </div>
        )}

        {initialLoading ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            Loading users/items...
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <label className="mb-2 block text-sm text-slate-300">
                Select demo user
              </label>

              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
              >
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} — {user.email}
                  </option>
                ))}
              </select>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      socketStatus === "Connected" ? "bg-green-400" : "bg-red-400"
                    }`}
                  />
                  <span>Socket status: {socketStatus}</span>
                </div>

                <span className="text-slate-400">
                  Last live update: {lastLiveUpdate || "No live update yet"}
                </span>
              </div>
            </div>

            {userDataLoading && (
              <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-300">
                Loading recommendation data...
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 lg:col-span-2">
                <h2 className="mb-4 text-xl font-semibold">Available Items</h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="mt-1 text-sm text-slate-400">
                            Category: {item.category || "uncategorized"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {actions.map((action) => (
                            <button
                              key={action}
                              disabled={loadingAction}
                              onClick={() => handleInteraction(item._id, action)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                            >
                              {loadingAction ? "Saving..." : action}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
                  <h2 className="mb-4 text-xl font-semibold">
                    Live Recommendations
                  </h2>

                  {recommendations.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No recommendations yet. Try interacting with some items.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                        >
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-slate-400">
                            {item.category} • Score: {item.recommendationScore}
                          </p>

                          {item.signals && (
                            <div className="mt-3 space-y-1 text-xs text-slate-300">
                              <p>Category: {item.signals.categoryAffinityScore}</p>
                              <p>Popularity: {item.signals.popularityScore}</p>
                              <p>Freshness: {item.signals.freshnessBonus}</p>
                              <p>Collaborative: {item.signals.collaborativeScore}</p>
                              <p>Matrix: {item.signals.matrixFactorizationScore}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
                  <h2 className="mb-4 text-xl font-semibold">User Analytics</h2>

                  {!analytics ? (
                    <p className="text-sm text-slate-400">No analytics yet.</p>
                  ) : (
                    <div className="space-y-4 text-sm">
                      <p>
                        Selected user:{" "}
                        <span className="font-semibold">{selectedUser?.name}</span>
                      </p>

                      <p>Total interactions: {analytics.totalInteractions}</p>

                      <div>
                        <p className="mb-2 font-semibold">Actions</p>
                        {Object.entries(analytics.actionsBreakdown || {}).map(
                          ([action, count]) => (
                            <p key={action} className="text-slate-300">
                              {action}: {count}
                            </p>
                          )
                        )}
                      </div>

                      <div>
                        <p className="mb-2 font-semibold">Categories</p>
                        {Object.entries(analytics.categoryBreakdown || {}).map(
                          ([category, count]) => (
                            <p key={category} className="text-slate-300">
                              {category}: {count}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
                  <h2 className="mb-4 text-xl font-semibold">Debug Panel</h2>

                  {!debugData ? (
                    <p className="text-sm text-slate-400">No debug data yet.</p>
                  ) : (
                    <div className="space-y-5 text-sm">
                      <div>
                        <p className="mb-2 font-semibold">Category Scores</p>
                        {Object.entries(debugData.categoryScores || {}).map(
                          ([category, score]) => (
                            <p key={category} className="text-slate-300">
                              {category}: {score}
                            </p>
                          )
                        )}
                      </div>

                      <div>
                        <p className="mb-2 font-semibold">Similar Users</p>
                        {debugData.collaborativeFiltering?.similarUsers?.length ? (
                          debugData.collaborativeFiltering.similarUsers.map(
                            (user) => (
                              <p key={user.userId} className="text-slate-300">
                                {user.userId} — similarity: {user.similarity}
                              </p>
                            )
                          )
                        ) : (
                          <p className="text-slate-400">No similar users yet.</p>
                        )}
                      </div>

                      <div>
                        <p className="mb-2 font-semibold">Matrix Factorization</p>
                        <p className="text-slate-300">
                          Users in matrix:{" "}
                          {debugData.matrixFactorization?.matrixShape?.users || 0}
                        </p>
                        <p className="text-slate-300">
                          Items in matrix:{" "}
                          {debugData.matrixFactorization?.matrixShape?.items || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default App;