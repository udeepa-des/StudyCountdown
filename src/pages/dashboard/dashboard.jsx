import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import TargetDateForm from "../../components/TargetDateForm/TargetDateForm";
import CountdownTimer from "../../components/CountdownTimer/CountdownTimer";
import StudyPlanForm from "../../components/StudyPlans/StudyPlanForm";
import StudyPlanList from "../../components/StudyPlans/StudyPlanList";
import SoundPlayer from "../../components/SoundPlayer/SoundPlayer";
import ProfilePopup from "../../components/ProfilePopup/ProfilePopup";
import SettingsModal from "../../components/SettingsModal/SettingsModal";
import Reminder from "../../components/Reminder/Reminder";
import ReminderModal from "../../components/ReminderModal/ReminderModal";
import Sidebar from "../../components/Sidebar/Sidebar"; // Import Sidebar
import Astronaut from "../../assets/avatars/astronaut.png";
import Bee from "../../assets/avatars/bee.png";
import Bat from "../../assets/avatars/bat.png";
import Boy from "../../assets/avatars/boy.png";
import Donkey from "../../assets/avatars/donkey.png";
import Fox from "../../assets/avatars/fox.png";
import Girl from "../../assets/avatars/girl.png";
import Gorilla from "../../assets/avatars/gorilla.png";
import Mutant from "../../assets/avatars/mutant.png";
import Penguin from "../../assets/avatars/penguin.png";
import SiberianHusky from "../../assets/avatars/siberian-husky.png";
import Sloth from "../../assets/avatars/sloth.png";
import Werewolf from "../../assets/avatars/werewolf.png";
import axios from "axios";
import Background1 from "../../assets/backgrounds/bg1.png";
import Background2 from "../../assets/backgrounds/bg2.jpg";
import Background3 from "../../assets/backgrounds/bg3.jpg";
import Background4 from "../../assets/backgrounds/bg4.png";
import Background5 from "../../assets/backgrounds/login-bg.jpg";
import Background6 from "../../assets/backgrounds/study-plan.jpg";
import LogoIcon from "../../assets/logo/logo.png";
import LogoTitle from "../../assets/logo/logo_title.png";
import SplashScreen from "../../components/SplashScreen/SplashScreen";
import ConfirmationPopup from "../../components/ConfirmationPopup/ConfirmationPopup";
import StudyPlanDetailModal from "../../components/StudyPlans/StudyPlanDetailModal/StudyPlanDetailModal";
import TodoWidget from "../../components/Todo/TodoWidget";
import { getDateAtMidnight } from "../../utils/getDateAtMidnight";
import { getAdvanceMs } from "../../utils/reminderUtils";
import toast from "react-hot-toast";

axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const TODO_STORAGE_KEY = "userTodos";

// Add a request interceptor to include the auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [targetDate, setTargetDate] = useState("");
  const [targetName, setTargetName] = useState("");
  const [todos, setTodos] = useState([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [todoFilter, setTodoFilter] = useState("all");
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [plans, setPlans] = useState([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [isTargetSet, setIsTargetSet] = useState(false);
  const [userId, setUserId] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("countdown");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Changed from isMobileMenuOpen
  const [userSettings, setUserSettings] = useState({
    name: "",
    avatar: "",
    email: "",
    notificationEmail: "",
    phone: "",
    emailNotifications: true,
    mobileNotifications: true,
    background: "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Reminder states
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderData, setReminderData] = useState(null);
  const [reminderTriggered, setReminderTriggered] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [remindersLoading, setRemindersLoading] = useState(false);

  const [showDeletePlanDialog, setShowDeletePlanDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [showDeleteReminderDialog, setShowDeleteReminderDialog] =
    useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);

  const motivationalQuotes = [
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
    "Success is the sum of small efforts, repeated day in and day out. - Robert Collier",
    "The secret of getting ahead is getting started. - Mark Twain",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
  ];

  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showTodoDeleteDialog, setShowTodoDeleteDialog] = useState(false);
  const [showTodoClearDialog, setShowTodoClearDialog] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState([]);

  const quoteRef = useRef();
  const previousRemindersRef = useRef(null);

  const avatars = [
    { id: "Astronaut", src: Astronaut },
    { id: "Bee", src: Bee },
    { id: "Bat", src: Bat },
    { id: "Boy", src: Boy },
    { id: "Donkey", src: Donkey },
    { id: "Fox", src: Fox },
    { id: "Girl", src: Girl },
    { id: "Gorilla", src: Gorilla },
    { id: "Mutant", src: Mutant },
    { id: "Penguin", src: Penguin },
    { id: "SiberianHusky", src: SiberianHusky },
    { id: "Sloth", src: Sloth },
    { id: "Werewolf", src: Werewolf },
  ];

  const backgroundOptions = [
    { id: "default", name: "Default", src: "" },
    { id: "bg1", name: "Midnight Café", src: Background1 },
    { id: "bg2", name: "Café de Lumière", src: Background2 },
    { id: "bg3", name: "LoFi Hangout", src: Background3 },
    { id: "bg4", name: "Golden Hour Study", src: Background4 },
    { id: "bg5", name: "Rainy Retreat", src: Background5 },
    { id: "bg6", name: "Study Haven", src: Background6 },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleBulkDeleteReminders = (ids) => {
    setIdsToDelete(ids);
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDeleteReminders = async () => {
    setIsDeleting(true);
    try {
      const idSet = new Set(idsToDelete);
      const updatedReminders = reminders.filter((r) => !idSet.has(r.id));
      setReminders(updatedReminders);
      await saveRemindersToAPI(updatedReminders);
      toast.success(`${idsToDelete.length} reminder(s) deleted successfully`);
    } catch (error) {
      console.error("Error bulk deleting reminders:", error);
      toast.error("Something went wrong when deleting reminders");
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteDialog(false);
      setIdsToDelete([]);
    }
  };

  const handleCancelBulkDelete = () => {
    setShowBulkDeleteDialog(false);
    setIdsToDelete([]);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setPageLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await axios.get("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("response: ", response);
        setUserSettings({
          name: response?.data?.name || "",
          avatar: response?.data?.avatar || "",
          email: response?.data?.email || "",
          notificationEmail:
            response?.data?.notificationEmail || response?.data?.email || "",
          phone: response?.data?.phone || "",
          emailNotifications: response?.data?.emailNotifications !== false,
          mobileNotifications: response?.data?.mobileNotifications !== false,
          background: response?.data?.background || "",
          reminders: response?.data?.reminders || [],
        });
        setEmail(response?.data?.email || "");
        setPhone(response?.data?.phone || "");
        setBackgroundImage(response?.data?.background || "");
        setUserId(response.data._id);
        if (response.data.targetDate) {
          setTargetDate(
            new Date(response.data.targetDate).toISOString().split("T")[0],
          );
          setTargetName(response.data.targetName);
          setIsTargetSet(true);
        }
        if (response.data.studyPlans) {
          setPlans(response.data.studyPlans || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
      } finally {
        setTimeout(() => {
          setPageLoading(false);
        }, 1500);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    setIsSidebarOpen(false); // Close sidebar when opening settings
  };

  const changeQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const currentIndex = motivationalQuotes.indexOf(currentQuote);
      const nextIndex = (currentIndex + 1) % motivationalQuotes.length;
      setCurrentQuote(motivationalQuotes[nextIndex]);
      setIsAnimating(false);
    }, 500);
  };

  useEffect(() => {
    const interval = setInterval(changeQuote, 10000);
    return () => clearInterval(interval);
  }, [currentQuote]);

  useEffect(() => {
    if (!targetDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = getDateAtMidnight(targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        handleDeleteCountdown();
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        handleDeleteCountdown();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const handleSetTargetDate = async (date, name) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/target-date",
        { targetDate: date, targetName: name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error("Error setting target date:", error);
      toast.error("Something went wrong when setting target");
    } finally {
      toast.success("Successfully added the target");
      setTargetDate(date);
      setIsTargetSet(true);
      setTargetName(name);
      setCountdown("");
    }
  };

  const handleUpdateTargetDate = async (date, name) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/target-date",
        { targetDate: date, targetName: name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error("Error setting target date:", error);
      toast.error("Something went wrong when setting target");
    } finally {
      toast.success("Successfully updated the target");
      setTargetDate(date);
      setIsTargetSet(true);
      setTargetName(name);
      setCountdown("");
      setIsEditing(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteCountdown = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete("/api/target-date", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsDeleting(false);
      setShowDeleteDialog(false);
      toast.success("Successfully deleted the target");
    } catch (error) {
      console.error("Error deleting target date:", error);
      setIsDeleting(false);
      toast.error("Something went wrong when deleting target");
    }

    setTargetDate("");
    setTargetName("");
    setCountdown("");
    setIsTargetSet(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleAddPlan = async (newPlan) => {
    try {
      const response = await axios.post("/api/plans", newPlan);
      setPlans((prevPlans) => [...prevPlans, response.data]);
    } catch (error) {
      console.error(
        "Error adding plan:",
        error.response ? error.response.data : error,
      );
    }
  };

  const handleToggleComplete = async (planId) => {
    const plan = plans.find((p) => p._id === planId);
    if (!plan) return;
    try {
      const response = await axios.put(`/api/plans/${planId}`, {
        completed: !plan.completed,
      });
      setPlans((prevPlans) =>
        prevPlans.map((p) => (p._id === planId ? response.data : p)),
      );
    } catch (error) {
      console.error("Error toggling plan:", error);
    }
  };

  const handleMarkDayStudied = async (planId) => {
    try {
      const response = await axios.patch(`/api/plans/${planId}/mark-day`);
      setPlans((prev) =>
        prev.map((p) => (p._id === planId ? response.data : p)),
      );
    } catch (err) {
      toast.error("Something went wrong when Marking as Studied");
      console.error("Mark day error:", err);
    }
  };

  const handleDeletePlan = (planId) => {
    setPlanToDelete(planId);
    setShowDeletePlanDialog(true);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/plans/${planToDelete}`);
      setPlans((prevPlans) => prevPlans.filter((p) => p._id !== planToDelete));
      toast.success("Study plan deleted successfully");
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Something went wrong when deleting the plan");
    } finally {
      setIsDeleting(false);
      setShowDeletePlanDialog(false);
      setPlanToDelete(null);
    }
  };

  const handleCancelDeletePlan = () => {
    setShowDeletePlanDialog(false);
    setPlanToDelete(null);
  };

  const handleDeleteReminderWithConfirm = (reminderId) => {
    setReminderToDelete(reminderId);
    setShowDeleteReminderDialog(true);
  };

  const confirmDeleteReminder = async () => {
    if (!reminderToDelete) return;

    setIsDeleting(true);
    try {
      await handleDeleteReminder(reminderToDelete);
      toast.success("Reminder deleted successfully");
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error("Something went wrong when deleting the reminder");
    } finally {
      setIsDeleting(false);
      setShowDeleteReminderDialog(false);
      setReminderToDelete(null);
    }
  };

  const handleCancelDeleteReminder = () => {
    setShowDeleteReminderDialog(false);
    setReminderToDelete(null);
  };

  const fetchReminders = async () => {
    setRemindersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/reminders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetched = response.data || [];

      // Skip diffing on the very first fetch — we only want to react to
      // reminders that flip to triggered *during* this session, not ones
      // that were already triggered before the tab was opened.
      if (previousRemindersRef.current !== null) {
        try {
          const prevById = new Map(
            previousRemindersRef.current.map((r) => [r.id, r]),
          );

          const newlyTriggered = fetched.find((r) => {
            const prev = prevById.get(r.id);
            return r.triggered && (!prev || !prev.triggered);
          });

          if (newlyTriggered) {
            setReminderData({
              id: newlyTriggered.id,
              label: newlyTriggered.label,
              date: newlyTriggered.date,
              time: newlyTriggered.time,
              targetName: targetName || newlyTriggered.label,
              targetDate: newlyTriggered.date,
              displayDateTime:
                newlyTriggered.displayDateTime ||
                formatDateTime(newlyTriggered.date, newlyTriggered.time),
              reminderTime: `${newlyTriggered.advanceNotice} ${newlyTriggered.advanceUnit} before`,
              notificationEmail: userSettings.notificationEmail,
              phone: userSettings.phone,
              reminder: newlyTriggered,
            });
            setShowReminderModal(true);
          }
        } catch (diffError) {
          console.error("Error detecting newly-triggered reminder:", diffError);
          toast.success("Error detecting newly-triggered reminder");
        }
      }

      previousRemindersRef.current = fetched;
      setReminders(fetched);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      const savedReminders = localStorage.getItem("userReminders");
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }
    } finally {
      setRemindersLoading(false);
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return "Not set";
    try {
      return new Date(`${date}T${time}`).toLocaleString();
    } catch {
      return `${date} ${time}`;
    }
  };

  useEffect(() => {
    fetchReminders(); // initial load, sets the baseline snapshot

    const pollInterval = setInterval(fetchReminders, 20000); // check every 20s

    // Also refresh immediately when the user comes back to the tab —
    // catches anything that triggered while they were away.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchReminders();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const saveRemindersToAPI = async (updatedReminders) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/reminders",
        { reminders: updatedReminders },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      localStorage.setItem("userReminders", JSON.stringify(updatedReminders));
    } catch (error) {
      console.error("Error saving reminders:", error);
      localStorage.setItem("userReminders", JSON.stringify(updatedReminders));
    }
  };

  const buildReminderPayload = (reminder) => ({
    id: reminder.id,
    label: reminder.label,
    date: reminder.date,
    time: reminder.time,
    targetName: targetName || reminder.label,
    targetDate: reminder.date,
    reminderTime: `${reminder.advanceNotice} ${reminder.advanceUnit} before`,
    notificationEmail: userSettings.notificationEmail,
    phone: userSettings.phone,
    reminder,
  });

  // Check reminders every 30 seconds
  // useEffect(() => {
  //   const checkReminders = () => {
  //     const now = new Date();
  //     let hasChanges = false;

  //     const updatedReminders = reminders.map((reminder) => {
  //       if (!reminder.isActive) return reminder;

  //       let updated = { ...reminder };

  //       if (updated.snoozedUntil) {
  //         const snoozeEnd = new Date(updated.snoozedUntil);
  //         if (now >= snoozeEnd) {
  //           updated.snoozedUntil = null;
  //           updated.triggered = true;
  //           hasChanges = true;
  //           handleReminderTrigger(buildReminderPayload(updated));
  //           return updated;
  //         }
  //         return updated;
  //       }

  //       if (updated.triggered) return updated;

  //       const advanceMs = getAdvanceMs(updated);
  //       const reminderDateTime = new Date(`${updated.date}T${updated.time}`);
  //       const triggerTime = new Date(reminderDateTime.getTime() - advanceMs);
  //       const timeDiff = now - triggerTime;

  //       if (timeDiff >= 0 && timeDiff < 90000) {
  //         updated.triggered = true;
  //         hasChanges = true;
  //         handleReminderTrigger(buildReminderPayload(updated));
  //       }

  //       return updated;
  //     });

  //     if (hasChanges) {
  //       setReminders(updatedReminders);
  //       saveRemindersToAPI(updatedReminders);
  //     }
  //   };

  //   const interval = setInterval(checkReminders, 30000);
  //   checkReminders();
  //   return () => clearInterval(interval);
  // }, [reminders]);

  const handleAddReminderSubmit = async (newReminderInput) => {
    const eventDateTime = new Date(
      `${newReminderInput.date}T${newReminderInput.time}`,
    ); // parsed correctly here, in the browser's real local timezone
    const advanceMs = getAdvanceMs(newReminderInput);
    const triggerAt = new Date(
      eventDateTime.getTime() - advanceMs,
    ).toISOString();

    const reminder = {
      id: Date.now().toString(),
      ...newReminderInput,
      isActive: true,
      triggered: false,
      snoozedUntil: null,
      triggerAt,
      eventAt: eventDateTime.toISOString(),
      displayDateTime: eventDateTime.toLocaleString(),
      createdAt: new Date().toISOString(),
    };
    const updatedReminders = [...reminders, reminder];
    setReminders(updatedReminders);
    await saveRemindersToAPI(updatedReminders);
  };

  const handleToggleReminder = async (id) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder || reminder.triggered) return;

    const updatedReminders = reminders.map((r) =>
      r.id === id ? { ...r, isActive: !r.isActive, snoozedUntil: null } : r,
    );
    setReminders(updatedReminders);
    await saveRemindersToAPI(updatedReminders);
  };

  const handleDeleteReminder = async (id) => {
    const updatedReminders = reminders.filter((r) => r.id !== id);
    setReminders(updatedReminders);
    await saveRemindersToAPI(updatedReminders);
  };

  const handleSnoozeReminder = (id) => {
    setReminders((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== id) return r;
        const snoozeUntil = new Date();
        snoozeUntil.setMinutes(snoozeUntil.getMinutes() + 5);
        return {
          ...r,
          snoozedUntil: snoozeUntil.toISOString(),
          triggered: false,
        };
      });
      saveRemindersToAPI(updated);
      return updated;
    });
  };

  const handleReminderTrigger = (data) => {
    setReminderData(data);
    setShowReminderModal(true);
  };

  const handleReminderSnooze = (reminderId) => {
    toast.success("Reminder snoozed for 5 minutes");
    setShowReminderModal(false);
    if (reminderId) {
      handleSnoozeReminder(reminderId);
    }
  };

  const handleReminderClose = () => {
    setShowReminderModal(false);
  };

  const persistTodosLocal = (list) => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(list));
  };

  const fetchTodos = async () => {
    setTodosLoading(true);
    try {
      const response = await axios.get("/api/todos");
      setTodos(response.data || []);
      persistTodosLocal(response.data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      const saved = localStorage.getItem(TODO_STORAGE_KEY);
      setTodos(saved ? JSON.parse(saved) : []);
    } finally {
      setTodosLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async (newTodo) => {
    const optimistic = {
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
      ...newTodo,
    };
    const updated = [optimistic, ...todos];
    setTodos(updated);
    persistTodosLocal(updated);

    try {
      const response = await axios.post("/api/todos", newTodo);
      const withServerId = updated.map((t) =>
        t.id === optimistic.id ? response.data : t,
      );
      setTodos(withServerId);
      persistTodosLocal(withServerId);
      toast.success("Task added");
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Saved locally — couldn't reach the server");
    }
  };

  const handleToggleTodo = async (id) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    setTodos(updated);
    persistTodosLocal(updated);

    try {
      await axios.patch(`/api/todos/${id}/toggle`);
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast.error("Couldn't sync task status");
    }
  };

  const handleUpdateTodo = async (id, fields) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, ...fields } : t));
    setTodos(updated);
    persistTodosLocal(updated);

    try {
      await axios.put(`/api/todos/${id}`, fields);
      toast.success("Task updated");
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Couldn't sync the update");
    }
  };

  const requestDeleteTodo = (id) => {
    setTodoToDelete(id);
    setShowTodoDeleteDialog(true);
  };

  const confirmDeleteTodo = async () => {
    if (!todoToDelete) return;
    setIsDeleting(true);
    try {
      const updated = todos.filter((t) => t.id !== todoToDelete);
      setTodos(updated);
      persistTodosLocal(updated);
      await axios.delete(`/api/todos/${todoToDelete}`);
      toast.success("Task deleted");
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Something went wrong when deleting the task");
    } finally {
      setIsDeleting(false);
      setShowTodoDeleteDialog(false);
      setTodoToDelete(null);
    }
  };

  const cancelDeleteTodo = () => {
    setShowTodoDeleteDialog(false);
    setTodoToDelete(null);
  };

  const requestClearCompletedTodos = () => setShowTodoClearDialog(true);

  const confirmTodoClearCompleted = async () => {
    setIsDeleting(true);
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    try {
      const updated = todos.filter((t) => !t.completed);
      setTodos(updated);
      persistTodosLocal(updated);
      await Promise.all(
        completedIds.map((id) => axios.delete(`/api/todos/${id}`)),
      );
      toast.success("Completed tasks cleared");
    } catch (error) {
      console.error("Error clearing completed todos:", error);
      toast.error("Something went wrong clearing completed tasks");
    } finally {
      setIsDeleting(false);
      setShowTodoClearDialog(false);
    }
  };

  const onLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (pageLoading) {
    return <SplashScreen />;
  }

  return (
    <div
      className={`whole-page ${darkMode ? "dark-mode" : ""}`}
      style={
        userSettings.background
          ? {
              backgroundImage: `url(${
                backgroundOptions.find(
                  (bg) => bg.id === userSettings.background,
                )?.src
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : {}
      }
    >
      <header className="app-header">
        <div className="logo-container">
          <img src={LogoIcon} alt="Logo" className="logo-icon" />
          <img src={LogoTitle} alt="Logo" className="logo-title" />
          {/* <h1>MindStreamer</h1> */}
        </div>
        <div className="header-actions">
          {/* Hamburger Menu - Mobile */}
          <div className="mobile-menu-wrapper">
            <button
              className="hamburger-button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
          </div>

          {/* Desktop Tabs */}
          <div className="tabs-container desktop-tabs">
            <button
              className={`tab-button ${activeTab === "countdown" ? "active" : ""}`}
              onClick={() => setActiveTab("countdown")}
            >
              Countdown
            </button>
            <button
              className={`tab-button ${activeTab === "plans" ? "active" : ""}`}
              onClick={() => setActiveTab("plans")}
            >
              Study Plans
            </button>
            <button
              className={`tab-button ${activeTab === "todos" ? "active" : ""}`}
              onClick={() => setActiveTab("todos")}
            >
              Todo
            </button>
          </div>

          <ProfilePopup
            darkMode={darkMode}
            onLogout={onLogout}
            onOpenSettings={handleOpenSettings}
            userAvatar={userSettings?.avatar}
            userName={userSettings?.name}
            avatars={avatars}
          />
        </div>
      </header>
      <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
        <div className="app-content">
          <div className="motivational-container">
            <p
              className={`motivational-quote ${
                isAnimating ? "animate-out" : "animate-in"
              }`}
            >
              "{currentQuote}"
            </p>
          </div>

          <div className="cards-container">
            {activeTab === "countdown" && (
              <>
                <div className="card">
                  <div
                    className={`${
                      isTargetSet ? "target-date-card" : "target-form-card"
                    } `}
                  >
                    {!isTargetSet && (
                      <TargetDateForm
                        targetName={targetName}
                        setTargetName={setTargetName}
                        targetDate={targetDate}
                        setTargetDate={setTargetDate}
                        handleSetTargetDate={handleSetTargetDate}
                        handleUpdateTargetDate={handleUpdateTargetDate}
                        setCountdown={setCountdown}
                        setIsTargetSet={setIsTargetSet}
                        isEditing={isEditing}
                      />
                    )}

                    {countdown && isTargetSet && (
                      <CountdownTimer
                        countdown={countdown}
                        setIsTargetSet={setIsTargetSet}
                        targetName={targetName}
                        onDelete={handleDeleteClick}
                        setIsEditing={setIsEditing}
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Reminder Card - Separate from Countdown */}
            <div
              className="card"
              style={{
                display:
                  activeTab === "plans" || activeTab === "todos" ? "none" : "",
              }}
            >
              <Reminder
                shouldDisplay={activeTab === "countdown"}
                darkMode={darkMode}
                reminders={reminders}
                loading={remindersLoading}
                onAddReminder={handleAddReminderSubmit}
                onToggleReminder={handleToggleReminder}
                onDeleteReminder={handleDeleteReminderWithConfirm}
                onBulkDeleteReminders={handleBulkDeleteReminders}
              />
            </div>

            {activeTab === "plans" && (
              <>
                <section>
                  <StudyPlanForm onAddPlan={handleAddPlan} />
                </section>

                <StudyPlanList
                  plans={plans}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeletePlan}
                  onShowMore={setSelectedPlan}
                />
              </>
            )}

            {activeTab === "todos" && (
              <TodoWidget
                todos={todos}
                loading={todosLoading}
                filter={todoFilter}
                setFilter={setTodoFilter}
                onAddTodo={handleAddTodo}
                onToggle={handleToggleTodo}
                onUpdate={handleUpdateTodo}
                onDelete={requestDeleteTodo}
                onClearCompleted={requestClearCompletedTodos}
              />
            )}
          </div>
        </div>
      </div>
      <SoundPlayer />

      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        darkMode={darkMode}
        userAvatar={userSettings?.avatar}
        userName={userSettings?.name}
        userEmail={userSettings?.email}
        onOpenSettings={handleOpenSettings}
        onLogout={onLogout}
        avatars={avatars}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        initialName={userSettings.name}
        initialAvatar={userSettings.avatar}
        initialAccountEmail={userSettings.email}
        initialNotificationEmail={userSettings.notificationEmail}
        initialPhone={userSettings.phone}
        initialEmailNotifications={userSettings.emailNotifications}
        initialMobileNotifications={userSettings.mobileNotifications}
        initialBackground={userSettings.background}
        avatars={avatars}
        backgroundOptions={backgroundOptions}
        onSave={(newSettings) => {
          setUserSettings({
            ...newSettings,
            email: newSettings.accountEmail,
          });
          setEmail(newSettings.accountEmail);
          setPhone(newSettings.phone);
          setIsSettingsOpen(false);
          if (newSettings.background !== userSettings.background) {
            const selectedBg = backgroundOptions.find(
              (bg) => bg.id === newSettings.background,
            );
            setBackgroundImage(selectedBg ? selectedBg.src : "");
          }
        }}
      />

      <ConfirmationPopup
        isOpen={showDeleteDialog}
        message="Are you sure you want to delete this countdown?"
        onConfirm={handleDeleteCountdown}
        onCancel={handleCancelDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        loadingLabel="Deleting..."
      />

      <ConfirmationPopup
        isOpen={showDeletePlanDialog}
        message="Are you sure you want to delete this study plan?"
        onConfirm={confirmDeletePlan}
        onCancel={handleCancelDeletePlan}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        loadingLabel="Deleting..."
      />

      <ConfirmationPopup
        isOpen={showDeleteReminderDialog}
        message="Are you sure you want to delete this reminder?"
        onConfirm={confirmDeleteReminder}
        onCancel={handleCancelDeleteReminder}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        loadingLabel="Deleting..."
      />

      <ConfirmationPopup
        isOpen={showBulkDeleteDialog}
        message={`Are you sure you want to delete ${idsToDelete.length} ${idsToDelete.length > 1 ? "reminders" : "reminder"}?`}
        onConfirm={confirmBulkDeleteReminders}
        onCancel={handleCancelBulkDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        loadingLabel="Deleting..."
      />

      <ConfirmationPopup
        isOpen={showTodoDeleteDialog}
        message="Are you sure you want to delete this task?"
        onConfirm={confirmDeleteTodo}
        onCancel={cancelDeleteTodo}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        loadingLabel="Deleting..."
      />

      <ConfirmationPopup
        isOpen={showTodoClearDialog}
        message="Delete all completed tasks?"
        onConfirm={confirmTodoClearCompleted}
        onCancel={() => setShowTodoClearDialog(false)}
        confirmLabel="Clear"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        loadingLabel="Clearing..."
      />

      {selectedPlan && (
        <StudyPlanDetailModal
          plan={plans.find((p) => p._id === selectedPlan._id) ?? selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onMarkDayStudied={handleMarkDayStudied}
        />
      )}

      {/* Reminder Modal at Dashboard Level */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={handleReminderClose}
        notificationEmail={
          userSettings?.notificationEmail || userSettings?.email
        }
        reminderData={reminderData}
        darkMode={darkMode}
        onSnooze={handleReminderSnooze}
      />
    </div>
  );
};

export default Dashboard;
