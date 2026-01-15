// ... imports

export default function OwnerDashboard() {
  // ... existing state

  // Replace your existing useEffect with this one:
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchOrders = async () => {
      if (!user) return;

      const result = await api.getAllOrders(user.email);

      if (result.success && result.orders) {
        // ... (keep your existing safeJSON logic here)
        const cleaned = result.orders.map((o) => ({
          ...o,
          items: safeJSON(o.items) || [],
          payment_data: safeJSON(o.payment_data) || {},
        }));
        setOrders(cleaned);
      }
      setLoading(false);
    };

    fetchOrders(); // Initial fetch
    intervalId = setInterval(fetchOrders, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [user]);

  // ... rest of component
