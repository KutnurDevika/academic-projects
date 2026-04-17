import java.util.*;
import java.time.*;
import java.time.format.*;
import java.time.temporal.ChronoUnit;

// ════════════════════════════════════════════════════════════
//  ACADMAP — Smart Academic Planning System (Java Console)
//  Features: Task Planner, Roadmap Generator, Timeline,
//            PBL Tracker, Skill Gap Engine, Admin Panel
// ════════════════════════════════════════════════════════════

public class AcadMap {

    static final String RESET  = "\033[0m";
    static final String BOLD   = "\033[1m";
    static final String PURPLE = "\033[35m";
    static final String CYAN   = "\033[36m";
    static final String GREEN  = "\033[32m";
    static final String YELLOW = "\033[33m";
    static final String RED    = "\033[31m";
    static final String BLUE   = "\033[34m";
    static final String DIM    = "\033[2m";

    // ── DATA STRUCTURES (DSA concepts: Stack, Queue, LinkedList) ──

    // Linked List Node for Roadmap
    static class MilestoneNode {
        int id;
        String title, semester, subject, targetDate, status;
        MilestoneNode next;
        MilestoneNode(int id, String title, String semester, String subject, String targetDate, String status) {
            this.id = id; this.title = title; this.semester = semester;
            this.subject = subject; this.targetDate = targetDate; this.status = status;
        }
    }

    // Linked List for Roadmap
    static class RoadmapLinkedList {
        MilestoneNode head;
        int size = 0;

        void add(MilestoneNode node) {
            if (head == null) { head = node; }
            else { MilestoneNode cur = head; while (cur.next != null) cur = cur.next; cur.next = node; }
            size++;
        }

        void remove(int id) {
            if (head == null) return;
            if (head.id == id) { head = head.next; size--; return; }
            MilestoneNode cur = head;
            while (cur.next != null && cur.next.id != id) cur = cur.next;
            if (cur.next != null) { cur.next = cur.next.next; size--; }
        }

        List<MilestoneNode> toList() {
            List<MilestoneNode> list = new ArrayList<>();
            MilestoneNode cur = head;
            while (cur != null) { list.add(cur); cur = cur.next; }
            return list;
        }
    }

    // Stack for Activity Feed (LIFO)
    static class ActivityStack {
        Deque<String> stack = new ArrayDeque<>();
        void push(String activity) {
            stack.push("[" + LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")) + "] " + activity);
            if (stack.size() > 10) {
                // remove last element
                Deque<String> temp = new ArrayDeque<>(stack);
                List<String> items = new ArrayList<>(temp);
                items.remove(items.size() - 1);
                stack = new ArrayDeque<>(items);
            }
        }
        List<String> getAll() { return new ArrayList<>(stack); }
    }

    // Queue for Notifications (FIFO)
    static class NotificationQueue {
        Queue<String> queue = new LinkedList<>();
        void enqueue(String msg) { queue.offer(msg); if (queue.size() > 20) queue.poll(); }
        List<String> getAll() { return new ArrayList<>(queue); }
        boolean isEmpty() { return queue.isEmpty(); }
    }

    // ── MODEL CLASSES ──────────────────────────────────────────

    static class Task {
        static int counter = 1;
        int id; String name, subject, priority, status, dueDate;
        Task(String name, String subject, String priority, String status, String dueDate) {
            this.id = counter++; this.name = name; this.subject = subject;
            this.priority = priority; this.status = status; this.dueDate = dueDate;
        }
    }

    static class Event {
        static int counter = 1;
        int id; String name, date, category;
        Event(String name, String date, String category) {
            this.id = counter++; this.name = name; this.date = date; this.category = category;
        }
    }

    static class Project {
        static int counter = 1;
        int id; String name, subject, targetDate, status;
        boolean githubPushed; String githubUrl;
        Project(String name, String subject, String targetDate, String status) {
            this.id = counter++; this.name = name; this.subject = subject;
            this.targetDate = targetDate; this.status = status; this.githubPushed = false; this.githubUrl = "";
        }
    }

    static class User {
        static int counter = 1;
        int id; String name, role;
        User(String name, String role) { this.id = counter++; this.name = name; this.role = role; }
    }

    // ── SKILL DATA ─────────────────────────────────────────────

    static final String[] SKILL_NAMES    = {"DSA","Web Dev","AI/ML","DBMS","Cloud","Networks"};
    static final int[]    SKILL_TARGETS  = {90, 90, 85, 90, 80, 85};
    static final String[][] SKILL_SUGGESTIONS = {
        {"Practice LeetCode arrays/trees daily","Study recursion & Dynamic Programming","Complete NPTEL DSA course"},
        {"Build 3 full-stack projects","Learn React and Node.js","Deploy on Vercel or Netlify"},
        {"Complete Andrew Ng ML course on Coursera","Practice on Kaggle datasets","Study neural networks basics"},
        {"Write 50 SQL queries daily","Study normalization forms (1NF-3NF)","Practice ER diagram design"},
        {"Get AWS Cloud Practitioner certification","Deploy a cloud-native application","Study serverless architecture"},
        {"Study OSI & TCP/IP models thoroughly","Practice Cisco Packet Tracer","Learn DNS, HTTP, TLS protocols"}
    };
    static final String[][] SKILL_RESOURCES = {
        {"GeeksforGeeks DSA","LeetCode 75","MIT OpenCourseWare 6.006"},
        {"The Odin Project","freeCodeCamp","MDN Web Docs"},
        {"Coursera ML by Andrew Ng","fast.ai","Kaggle Learn"},
        {"SQLZoo","Khan Academy SQL","Stanford DB Course"},
        {"AWS Skill Builder","Google Cloud Skills Boost","A Cloud Guru"},
        {"Cisco NetAcad","Professor Messer CompTIA","Computerphile YouTube"}
    };

    // ── APPLICATION STATE ──────────────────────────────────────

    static List<Task>    tasks    = new ArrayList<>();
    static List<Event>   events   = new ArrayList<>();
    static List<Project> projects = new ArrayList<>();
    static List<User>    users    = new ArrayList<>();
    static RoadmapLinkedList roadmap = new RoadmapLinkedList();
    static ActivityStack activityFeed = new ActivityStack();
    static NotificationQueue notifications = new NotificationQueue();
    static Map<String, Integer> skillScores = new LinkedHashMap<>();
    static String currentUser = "Student";
    static int milestoneIdCounter = 1;
    static Scanner sc = new Scanner(System.in);

    // ── MAIN ENTRY ─────────────────────────────────────────────

    public static void main(String[] args) {
        initSkillScores();
        loadSampleData();
        showWelcome();
        loginFlow();
        mainMenu();
    }

    static void initSkillScores() {
        skillScores.put("DSA", 60);
        skillScores.put("Web Dev", 70);
        skillScores.put("AI/ML", 40);
        skillScores.put("DBMS", 80);
        skillScores.put("Cloud", 50);
        skillScores.put("Networks", 55);
    }

    static void loadSampleData() {
        // Sample tasks
        tasks.add(new Task("Complete DSA Assignment", "DSA", "High", "In Progress", "2026-03-20"));
        tasks.add(new Task("Build React Portfolio", "Web Dev", "Medium", "Not Started", "2026-03-25"));
        tasks.add(new Task("Kaggle ML Practice", "AI/ML", "High", "Not Started", "2026-03-18"));
        tasks.add(new Task("SQL Query Practice (50)", "DBMS", "Low", "Completed", "2026-03-10"));

        // Sample events
        events.add(new Event("DSA Mid-Semester Exam", "2026-03-22", "Exam"));
        events.add(new Event("Web Dev Project Presentation", "2026-03-28", "Presentation"));
        events.add(new Event("Cloud Computing Lab", "2026-03-15", "Lab"));

        // Sample projects
        projects.add(new Project("Smart Campus IoT", "Networks", "2026-04-01", "In Progress"));
        projects.add(new Project("ML Sentiment Analyser", "AI/ML", "2026-03-30", "Not Started"));

        // Sample users
        users.add(new User("Priya Sharma", "Student"));
        users.add(new User("Prof. Ramesh Kumar", "Teacher"));

        // Sample milestones (LinkedList)
        roadmap.add(new MilestoneNode(milestoneIdCounter++, "Master Arrays & Linked Lists","Semester 3","DSA","2026-04-15","In Progress"));
        roadmap.add(new MilestoneNode(milestoneIdCounter++, "Complete React Fundamentals","Semester 3","Web Dev","2026-04-30","Not Started"));
        roadmap.add(new MilestoneNode(milestoneIdCounter++, "Finish Andrew Ng ML Course","Semester 4","AI/ML","2026-06-01","Not Started"));

        // Seed activity
        activityFeed.push("AcadMap session started");
        activityFeed.push("Sample data loaded for demo");
        notifications.enqueue("Welcome to AcadMap! Review your skill gaps.");
        notifications.enqueue("3 tasks are pending — check your planner.");
    }

    // ── WELCOME SCREEN ─────────────────────────────────────────

    static void showWelcome() {
        cls();
        println(PURPLE + BOLD);
        println("  ╔══════════════════════════════════════════════════════╗");
        println("  ║                                                      ║");
        println("  ║    █████╗  ██████╗ █████╗ ██████╗                   ║");
        println("  ║   ██╔══██╗██╔════╝██╔══██╗██╔══██╗                  ║");
        println("  ║   ███████║██║     ███████║██║  ██║                   ║");
        println("  ║   ██╔══██║██║     ██╔══██║██║  ██║                   ║");
        println("  ║   ██║  ██║╚██████╗██║  ██║██████╔╝                  ║");
        println("  ║   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═════╝                  ║");
        println("  ║                    MAP                               ║");
        println("  ║        Smart Academic Planning System                ║");
        println("  ║                                                      ║");
        println("  ╚══════════════════════════════════════════════════════╝" + RESET);
        println(DIM + "         Powered by DSA: Linked Lists · Stacks · Queues" + RESET);
        println();
        pause(1200);
    }

    // ── LOGIN FLOW ─────────────────────────────────────────────

    static void loginFlow() {
        cls();
        header("SIGN IN");
        print(CYAN + "  Enter your name (or press Enter for demo): " + RESET);
        String name = sc.nextLine().trim();
        if (!name.isEmpty()) currentUser = name;
        activityFeed.push("Logged in as: " + currentUser);
        println(GREEN + "  ✓ Welcome, " + currentUser + "! Loading dashboard…" + RESET);
        pause(800);
    }

    // ── MAIN MENU ──────────────────────────────────────────────

    static void mainMenu() {
        while (true) {
            cls();
            showDashboardHeader();
            println();
            println(BOLD + "  ┌─────────────────────────────────────────────────┐" + RESET);
            println(BOLD + "  │               MAIN MENU                        │" + RESET);
            println(BOLD + "  └─────────────────────────────────────────────────┘" + RESET);
            println();
            menuItem("1", "📊", "Overview Dashboard");
            menuItem("2", "✅", "Task Planner        (Stack-based Activity Log)");
            menuItem("3", "🗺️", "Academic Roadmap    (Linked List Generator)");
            menuItem("4", "📅", "Timeline            (Event Manager)");
            menuItem("5", "🔬", "PBL Tracker         (Project-Based Learning)");
            menuItem("6", "🧠", "Skill Gap Engine    (Auto-Detection + Suggestions)");
            menuItem("7", "👥", "Admin Panel         (Users & Monitoring)");
            menuItem("8", "🔔", "Smart Reminders     (Queue-based Notifications)");
            menuItem("0", "🚪", "Exit");
            println();
            print(CYAN + "  ▶ Choose an option: " + RESET);
            String choice = sc.nextLine().trim();
            switch (choice) {
                case "1" -> overviewDashboard();
                case "2" -> taskPlanner();
                case "3" -> roadmapSection();
                case "4" -> timelineSection();
                case "5" -> pblTracker();
                case "6" -> skillGapEngine();
                case "7" -> adminPanel();
                case "8" -> smartReminders();
                case "0" -> { println(PURPLE + "\n  Goodbye, " + currentUser + "! Keep learning. 🚀\n" + RESET); return; }
                default  -> toast("Invalid option. Please try again.");
            }
        }
    }

    // ── 1. OVERVIEW DASHBOARD ──────────────────────────────────

    static void overviewDashboard() {
        cls();
        header("OVERVIEW DASHBOARD");
        showDashboardHeader();

        // Stats row
        long totalTasks = tasks.size();
        long doneTasks  = tasks.stream().filter(t -> t.status.equals("Completed")).count();
        long totalProj  = projects.size();
        long doneProj   = projects.stream().filter(p -> p.status.equals("Completed")).count();
        long gapCount   = detectGaps().size();
        int  pct        = totalTasks > 0 ? (int)(doneTasks * 100 / totalTasks) : 0;

        println();
        println("  ┌──────────────────────────────────────────────────────────────┐");
        println("  │                     QUICK STATS                              │");
        println("  ├────────────────┬────────────────┬────────────────┬───────────┤");
        printf("  │ " + CYAN + "Tasks" + RESET + "     %3d    │ " + GREEN + "Projects" + RESET + "   %3d    │ " + YELLOW + "Events" + RESET + "     %3d    │ " + RED + "Gaps" + RESET + "    %2d  │%n",
               totalTasks, totalProj, events.size(), gapCount);
        printf("  │ Done: " + GREEN + "%3d" + RESET + " (%3d%%)│ Done: " + GREEN + "%3d" + RESET + "        │ Upcoming: " + YELLOW + "%3d" + RESET + "    │ Subjects  │%n",
               doneTasks, pct, doneProj, upcomingEventsCount(7));
        println("  └────────────────┴────────────────┴────────────────┴───────────┘");

        // Progress bar
        println();
        print("  " + BOLD + "Task Completion: " + RESET);
        progressBar(pct, 40);
        println(" " + CYAN + pct + "%" + RESET);

        // Skill snapshot
        println();
        println(BOLD + "  Skill Snapshot:" + RESET);
        for (int i = 0; i < SKILL_NAMES.length; i++) {
            String name = SKILL_NAMES[i];
            int score = skillScores.getOrDefault(name, 0);
            boolean isGap = score < 60;
            print("  " + (isGap ? RED : GREEN) + String.format("%-10s", name) + RESET + " ");
            miniBar(score, 20);
            print(" " + BOLD + score + "%" + RESET);
            if (isGap) print(" " + RED + " ⚠ GAP" + RESET);
            println();
        }

        // Upcoming deadlines
        println();
        println(BOLD + "  Upcoming Deadlines (next 7 days):" + RESET);
        renderUpcomingDeadlines(5);

        // Activity feed (Stack — LIFO)
        println();
        println(BOLD + "  Recent Activity (Stack — LIFO):" + RESET);
        List<String> acts = activityFeed.getAll();
        int shown = 0;
        for (String a : acts) {
            if (shown++ >= 5) break;
            println("  " + DIM + "• " + a + RESET);
        }
        if (acts.isEmpty()) println("  " + DIM + "No activity yet." + RESET);

        println();
        pressEnter();
    }

    // ── 2. TASK PLANNER ────────────────────────────────────────

    static void taskPlanner() {
        while (true) {
            cls();
            header("TASK PLANNER");
            long total = tasks.size();
            long done  = tasks.stream().filter(t -> t.status.equals("Completed")).count();
            int  pct   = total > 0 ? (int)(done * 100 / total) : 0;
            println("  Tasks: " + total + "  |  Done: " + done + "  |  Pending: " + (total - done));
            print("  Progress: "); progressBar(pct, 40); println(" " + pct + "%");
            println();
            menuItem("1", "➕", "Add Task");
            menuItem("2", "📋", "View All Tasks");
            menuItem("3", "✅", "Mark Task Complete / Reopen");
            menuItem("4", "🗑️", "Delete Task");
            menuItem("5", "🔍", "Filter Tasks by Priority");
            menuItem("0", "⬅️", "Back");
            println();
            print(CYAN + "  ▶ Choice: " + RESET);
            switch (sc.nextLine().trim()) {
                case "1" -> addTask();
                case "2" -> viewTasks(null);
                case "3" -> toggleTask();
                case "4" -> deleteTask();
                case "5" -> filterTasks();
                case "0" -> { return; }
                default  -> toast("Invalid option.");
            }
        }
    }

    static void addTask() {
        cls(); header("ADD TASK");
        String name     = prompt("Task name");
        if (name.isEmpty()) { toast("Name cannot be empty."); return; }
        String subject  = promptMenu("Subject", SKILL_NAMES);
        String priority = promptMenu("Priority", new String[]{"High","Medium","Low"});
        String status   = promptMenu("Status",   new String[]{"Not Started","In Progress","Completed"});
        String dueDate  = promptDate("Due date (YYYY-MM-DD, or Enter to skip)");
        tasks.add(new Task(name, subject, priority, status, dueDate));
        activityFeed.push("Task added: \"" + name + "\"");
        notifications.enqueue("📌 New task: " + name);
        toast("✓ Task \"" + name + "\" added!");
    }

    static void viewTasks(String filterPriority) {
        cls(); header(filterPriority == null ? "ALL TASKS" : "TASKS — " + filterPriority.toUpperCase());
        if (tasks.isEmpty()) { println("  " + DIM + "No tasks yet." + RESET); pressEnter(); return; }
        LocalDate today = LocalDate.now();
        println();
        println("  " + BOLD + String.format("%-4s %-28s %-10s %-8s %-14s %-12s", "ID","Task","Subject","Priority","Status","Due Date") + RESET);
        println("  " + "─".repeat(80));
        for (Task t : tasks) {
            if (filterPriority != null && !t.priority.equals(filterPriority) && !filterPriority.equals("Completed")) continue;
            if (filterPriority != null && filterPriority.equals("Completed") && !t.status.equals("Completed")) continue;
            boolean overdue = !t.dueDate.isEmpty() && LocalDate.parse(t.dueDate).isBefore(today) && !t.status.equals("Completed");
            String prCol = t.priority.equals("High") ? RED : t.priority.equals("Medium") ? YELLOW : GREEN;
            String stCol = t.status.equals("Completed") ? GREEN : t.status.equals("In Progress") ? CYAN : DIM;
            printf("  %-4d " + (t.status.equals("Completed") ? DIM : "") + "%-28s" + RESET + " %-10s " + prCol + "%-8s" + RESET + " " + stCol + "%-14s" + RESET + " " + (overdue ? RED : "") + "%-12s" + RESET + (overdue ? RED + " ⚠" + RESET : "") + "%n",
                t.id, truncate(t.name, 27), t.subject, t.priority, t.status, t.dueDate.isEmpty() ? "—" : t.dueDate);
        }
        println();
        pressEnter();
    }

    static void toggleTask() {
        viewTasks(null);
        print(CYAN + "  Enter Task ID to toggle: " + RESET);
        int id = readInt();
        for (Task t : tasks) {
            if (t.id == id) {
                t.status = t.status.equals("Completed") ? "Not Started" : "Completed";
                activityFeed.push((t.status.equals("Completed") ? "✅ Completed" : "↩ Reopened") + ": \"" + t.name + "\"");
                toast("✓ Task \"" + t.name + "\" → " + t.status);
                return;
            }
        }
        toast("Task ID not found.");
    }

    static void deleteTask() {
        viewTasks(null);
        print(CYAN + "  Enter Task ID to delete: " + RESET);
        int id = readInt();
        boolean removed = tasks.removeIf(t -> t.id == id);
        if (removed) { toast("✓ Task deleted."); activityFeed.push("Task deleted (ID: " + id + ")"); }
        else toast("Task ID not found.");
    }

    static void filterTasks() {
        cls(); header("FILTER TASKS");
        String[] opts = {"All","High","Medium","Low","Completed"};
        menuItem("1","🔴","High Priority");
        menuItem("2","🟡","Medium Priority");
        menuItem("3","🟢","Low Priority");
        menuItem("4","✅","Completed");
        menuItem("5","📋","All Tasks");
        println(); print(CYAN + "  ▶ Choice: " + RESET);
        String c = sc.nextLine().trim();
        switch(c) {
            case "1" -> viewTasks("High");
            case "2" -> viewTasks("Medium");
            case "3" -> viewTasks("Low");
            case "4" -> viewTasks("Completed");
            case "5" -> viewTasks(null);
        }
    }

    // ── 3. ROADMAP GENERATOR (Linked List) ────────────────────

    static void roadmapSection() {
        while (true) {
            cls();
            header("ACADEMIC ROADMAP  [Linked List]");
            println("  Milestones in roadmap: " + CYAN + roadmap.size + RESET + "  (each node = one milestone)");
            println();
            menuItem("1", "➕", "Add Milestone to Roadmap");
            menuItem("2", "🗺️", "View Roadmap");
            menuItem("3", "✏️", "Update Milestone Status");
            menuItem("4", "🗑️", "Remove Milestone");
            menuItem("0", "⬅️", "Back");
            println(); print(CYAN + "  ▶ Choice: " + RESET);
            switch (sc.nextLine().trim()) {
                case "1" -> addMilestone();
                case "2" -> viewRoadmap();
                case "3" -> updateMilestoneStatus();
                case "4" -> removeMilestone();
                case "0" -> { return; }
                default  -> toast("Invalid option.");
            }
        }
    }

    static void addMilestone() {
        cls(); header("ADD MILESTONE");
        String title   = prompt("Milestone title");
        if (title.isEmpty()) { toast("Title cannot be empty."); return; }
        String[] sems  = {"Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"};
        String sem     = promptMenu("Semester", sems);
        String subject = promptMenu("Subject", SKILL_NAMES);
        String date    = promptDate("Target date (YYYY-MM-DD, or Enter to skip)");
        String status  = promptMenu("Status", new String[]{"Not Started","In Progress","Completed"});
        MilestoneNode node = new MilestoneNode(milestoneIdCounter++, title, sem, subject, date, status);
        roadmap.add(node);
        activityFeed.push("Milestone added: \"" + title + "\" [" + sem + "]");
        toast("✓ Milestone \"" + title + "\" appended to Linked List!");
    }

    static void viewRoadmap() {
        cls(); header("ACADEMIC ROADMAP  — Linked List Traversal");
        List<MilestoneNode> nodes = roadmap.toList();
        if (nodes.isEmpty()) { println("  " + DIM + "No milestones. Add your first!" + RESET); pressEnter(); return; }

        // Group by semester
        Map<String, List<MilestoneNode>> grouped = new LinkedHashMap<>();
        for (MilestoneNode n : nodes) grouped.computeIfAbsent(n.semester, k -> new ArrayList<>()).add(n);

        int idx = 1;
        for (Map.Entry<String, List<MilestoneNode>> entry : grouped.entrySet()) {
            println();
            println("  " + PURPLE + BOLD + "━━ " + entry.getKey() + " ━━" + RESET);
            for (MilestoneNode m : entry.getValue()) {
                String stCol = m.status.equals("Completed") ? GREEN : m.status.equals("In Progress") ? CYAN : DIM;
                String icon  = m.status.equals("Completed") ? "✅" : m.status.equals("In Progress") ? "🔄" : "⏳";
                println("  │");
                println("  ├── [" + CYAN + m.id + RESET + "] " + BOLD + m.title + RESET);
                println("  │   " + DIM + "Subject: " + RESET + m.subject + "  |  Target: " + (m.targetDate.isEmpty() ? "—" : m.targetDate) + "  |  Status: " + stCol + icon + " " + m.status + RESET);
                if (idx < nodes.size()) print("  │   → next: ");
                MilestoneNode cur = roadmap.head;
                boolean foundNext = false;
                while (cur != null && cur.id != m.id) cur = cur.next;
                if (cur != null && cur.next != null) {
                    println(DIM + "Node[" + cur.next.id + "] \"" + cur.next.title + "\"" + RESET);
                    foundNext = true;
                }
                if (!foundNext && cur != null && cur.next == null) println(DIM + "null  (tail of list)" + RESET);
                idx++;
            }
        }
        println();
        pressEnter();
    }

    static void updateMilestoneStatus() {
        viewRoadmap();
        print(CYAN + "  Enter Milestone ID to update: " + RESET);
        int id = readInt();
        String status = promptMenu("New Status", new String[]{"Not Started","In Progress","Completed"});
        MilestoneNode cur = roadmap.head;
        while (cur != null) {
            if (cur.id == id) { cur.status = status; activityFeed.push("Milestone #" + id + " → " + status); toast("✓ Updated!"); return; }
            cur = cur.next;
        }
        toast("Milestone ID not found.");
    }

    static void removeMilestone() {
        viewRoadmap();
        print(CYAN + "  Enter Milestone ID to remove: " + RESET);
        int id = readInt();
        roadmap.remove(id);
        activityFeed.push("Milestone #" + id + " removed from roadmap");
        toast("✓ Milestone removed from Linked List.");
    }

    // ── 4. TIMELINE ────────────────────────────────────────────

    static void timelineSection() {
        while (true) {
            cls();
            header("EVENT TIMELINE");
            println("  Events tracked: " + CYAN + events.size() + RESET);
            println();
            menuItem("1", "➕", "Add Event");
            menuItem("2", "📅", "View Timeline");
            menuItem("3", "🗑️", "Remove Event");
            menuItem("0", "⬅️", "Back");
            println(); print(CYAN + "  ▶ Choice: " + RESET);
            switch (sc.nextLine().trim()) {
                case "1" -> addEvent();
                case "2" -> viewTimeline();
                case "3" -> removeEvent();
                case "0" -> { return; }
                default  -> toast("Invalid option.");
            }
        }
    }

    static void addEvent() {
        cls(); header("ADD EVENT");
        String name = prompt("Event name");
        if (name.isEmpty()) { toast("Name cannot be empty."); return; }
        String date = promptDate("Date (YYYY-MM-DD, or Enter to skip)");
        String cat  = promptMenu("Category", new String[]{"Exam","Assignment","Presentation","Lab","Other"});
        events.add(new Event(name, date, cat));
        activityFeed.push("Event added: \"" + name + "\"");
        notifications.enqueue("📅 Upcoming: " + name + (date.isEmpty() ? "" : " on " + date));
        toast("✓ Event \"" + name + "\" added!");
    }

    static void viewTimeline() {
        cls(); header("EVENTS TIMELINE");
        if (events.isEmpty()) { println("  " + DIM + "No events yet." + RESET); pressEnter(); return; }
        LocalDate today = LocalDate.now();
        List<Event> sorted = new ArrayList<>(events);
        sorted.sort((a, b) -> {
            if (a.date.isEmpty() && b.date.isEmpty()) return 0;
            if (a.date.isEmpty()) return 1;
            if (b.date.isEmpty()) return -1;
            return a.date.compareTo(b.date);
        });
        println();
        println("  " + BOLD + String.format("%-4s %-28s %-14s %-12s %-10s", "ID","Event","Category","Date","Days Left") + RESET);
        println("  " + "─".repeat(72));
        for (Event e : sorted) {
            String daysLabel = "—";
            String daysColor = DIM;
            if (!e.date.isEmpty()) {
                long days = ChronoUnit.DAYS.between(today, LocalDate.parse(e.date));
                if (days < 0)    { daysLabel = "PASSED";  daysColor = DIM; }
                else if (days==0){ daysLabel = "TODAY!";  daysColor = YELLOW + BOLD; }
                else if (days<=3){ daysLabel = days+"d left"; daysColor = RED; }
                else if (days<=7){ daysLabel = days+"d left"; daysColor = YELLOW; }
                else             { daysLabel = days+"d";      daysColor = GREEN; }
            }
            printf("  %-4d %-28s %-14s %-12s " + daysColor + "%-10s" + RESET + "%n",
                e.id, truncate(e.name, 27), e.category, e.date.isEmpty()?"—":e.date, daysLabel);
        }
        println();
        pressEnter();
    }

    static void removeEvent() {
        viewTimeline();
        print(CYAN + "  Enter Event ID to remove: " + RESET);
        int id = readInt();
        boolean removed = events.removeIf(e -> e.id == id);
        if (removed) toast("✓ Event removed."); else toast("Event ID not found.");
    }

    // ── 5. PBL TRACKER ────────────────────────────────────────

    static void pblTracker() {
        while (true) {
            cls();
            header("PBL TRACKER  — Project-Based Learning");
            long done = projects.stream().filter(p -> p.status.equals("Completed")).count();
            long inPr = projects.stream().filter(p -> p.status.equals("In Progress")).count();
            println("  Projects: " + projects.size() + "  |  Done: " + GREEN + done + RESET + "  |  In Progress: " + CYAN + inPr + RESET);
            println();
            menuItem("1", "➕", "Add Project");
            menuItem("2", "📋", "View Projects");
            menuItem("3", "✏️", "Update Project Status");
            menuItem("4", "🐙", "Mark GitHub Push");
            menuItem("5", "🗑️", "Delete Project");
            menuItem("0", "⬅️", "Back");
            println(); print(CYAN + "  ▶ Choice: " + RESET);
            switch (sc.nextLine().trim()) {
                case "1" -> addProject();
                case "2" -> viewProjects();
                case "3" -> updateProjectStatus();
                case "4" -> markGitHub();
                case "5" -> deleteProject();
                case "0" -> { return; }
                default  -> toast("Invalid option.");
            }
        }
    }

    static void addProject() {
        cls(); header("ADD PROJECT");
        String name    = prompt("Project name");
        if (name.isEmpty()) { toast("Name cannot be empty."); return; }
        String subject = prompt("Subject / Domain");
        String date    = promptDate("Target date (YYYY-MM-DD, or Enter to skip)");
        String status  = promptMenu("Status", new String[]{"Not Started","In Progress","Completed"});
        projects.add(new Project(name, subject, date, status));
        activityFeed.push("Project added: \"" + name + "\"");
        toast("✓ Project \"" + name + "\" added!");
        if (status.equals("Completed")) println(YELLOW + "\n  💡 Tip: Don't forget to push this project to GitHub!" + RESET);
    }

    static void viewProjects() {
        cls(); header("PROJECTS LIST");
        if (projects.isEmpty()) { println("  " + DIM + "No projects yet." + RESET); pressEnter(); return; }
        LocalDate today = LocalDate.now();
        println();
        println("  " + BOLD + String.format("%-4s %-24s %-12s %-12s %-14s %-8s", "ID","Project","Subject","Due Date","Status","GitHub") + RESET);
        println("  " + "─".repeat(80));
        for (Project p : projects) {
            boolean overdue = !p.targetDate.isEmpty() && LocalDate.parse(p.targetDate).isBefore(today) && !p.status.equals("Completed");
            String stCol = p.status.equals("Completed") ? GREEN : p.status.equals("In Progress") ? CYAN : DIM;
            String ghTag = p.githubPushed ? GREEN + "✓ Pushed" + RESET : (p.status.equals("Completed") ? RED + "! Upload" + RESET : DIM + "—" + RESET);
            printf("  %-4d %-24s %-12s " + (overdue ? RED : "") + "%-12s" + RESET + " " + stCol + "%-14s" + RESET + " %s%n",
                p.id, truncate(p.name, 23), truncate(p.subject, 11), p.targetDate.isEmpty()?"—":p.targetDate, p.status, ghTag);
        }
        println();
        pressEnter();
    }

    static void updateProjectStatus() {
        viewProjects();
        print(CYAN + "  Enter Project ID to update: " + RESET);
        int id = readInt();
        String status = promptMenu("New Status", new String[]{"Not Started","In Progress","Completed"});
        for (Project p : projects) {
            if (p.id == id) {
                boolean wasCompleted = p.status.equals("Completed");
                p.status = status;
                activityFeed.push("Project \"" + p.name + "\" → " + status);
                toast("✓ Updated!");
                if (status.equals("Completed") && !wasCompleted && !p.githubPushed) {
                    println(YELLOW + "\n  🐙 Project complete! Use option 4 to record your GitHub push." + RESET);
                    pressEnter();
                }
                return;
            }
        }
        toast("Project ID not found.");
    }

    static void markGitHub() {
        viewProjects();
        print(CYAN + "  Enter Project ID: " + RESET);
        int id = readInt();
        for (Project p : projects) {
            if (p.id == id) {
                if (!p.status.equals("Completed")) { toast("Project must be Completed first."); return; }
                print(CYAN + "  GitHub URL: " + RESET);
                String url = sc.nextLine().trim();
                if (url.isEmpty()) { toast("URL cannot be empty."); return; }
                p.githubPushed = true; p.githubUrl = url;
                activityFeed.push("🐙 GitHub push: \"" + p.name + "\" → " + url);
                notifications.enqueue("✅ " + p.name + " pushed to GitHub!");
                toast("🎉 GitHub push recorded for \"" + p.name + "\"!");
                return;
            }
        }
        toast("Project ID not found.");
    }

    static void deleteProject() {
        viewProjects();
        print(CYAN + "  Enter Project ID to delete: " + RESET);
        int id = readInt();
        boolean removed = projects.removeIf(p -> p.id == id);
        if (removed) toast("✓ Project deleted."); else toast("Project ID not found.");
    }

    // ── 6. SKILL GAP ENGINE ────────────────────────────────────

    static void skillGapEngine() {
        while (true) {
            cls();
            header("SKILL GAP ENGINE  — Auto-Detection & Suggestions");
            println();
            menuItem("1", "📊", "View Skill Proficiency");
            menuItem("2", "✏️", "Update Skill Scores");
            menuItem("3", "⚠️", "View Skill Gaps & Suggestions");
            menuItem("4", "🎯", "Radar Chart (ASCII)");
            menuItem("0", "⬅️", "Back");
            println(); print(CYAN + "  ▶ Choice: " + RESET);
            switch (sc.nextLine().trim()) {
                case "1" -> viewSkillProficiency();
                case "2" -> updateSkillScores();
                case "3" -> viewSkillGaps();
                case "4" -> renderRadarChart();
                case "0" -> { return; }
                default  -> toast("Invalid option.");
            }
        }
    }

    static void viewSkillProficiency() {
        cls(); header("SKILL PROFICIENCY OVERVIEW");
        println();
        println("  " + BOLD + String.format("%-12s %-6s %-6s %-36s %-8s", "Skill","Score","Target","Bar","Status") + RESET);
        println("  " + "─".repeat(72));
        for (int i = 0; i < SKILL_NAMES.length; i++) {
            String name = SKILL_NAMES[i];
            int score   = skillScores.getOrDefault(name, 0);
            int target  = SKILL_TARGETS[i];
            boolean gap = score < 60;
            String col  = gap ? RED : score >= 80 ? GREEN : YELLOW;
            String status = gap ? RED + "GAP ⚠" + RESET : score >= 80 ? GREEN + "Strong ✓" + RESET : YELLOW + "Improving" + RESET;
            printf("  " + col + "%-12s" + RESET + " %-6d %-6d ", name, score, target);
            miniBar(score, 30);
            print(" "); miniTarget(score, target, 30);
            println("  " + status);
        }
        println();
        long gaps = detectGaps().size();
        if (gaps > 0) println("  " + RED + BOLD + gaps + " skill gap(s) detected (below 60%)." + RESET);
        else          println("  " + GREEN + BOLD + "✅ All skills above the gap threshold!" + RESET);
        println();
        pressEnter();
    }

    static void updateSkillScores() {
        cls(); header("UPDATE SKILL SCORES");
        println("  Enter your proficiency level (0–100) for each skill.");
        println("  Scores below 60% are flagged as gaps. Press Enter to keep current value.");
        println();
        for (String name : SKILL_NAMES) {
            int current = skillScores.getOrDefault(name, 0);
            print("  " + CYAN + String.format("%-10s", name) + RESET + " [current: " + current + "] → ");
            String input = sc.nextLine().trim();
            if (!input.isEmpty()) {
                try {
                    int val = Integer.parseInt(input);
                    if (val < 0 || val > 100) { println(RED + "    Invalid! Keeping " + current + "%" + RESET); }
                    else skillScores.put(name, val);
                } catch (NumberFormatException e) {
                    println(RED + "    Invalid! Keeping " + current + "%" + RESET);
                }
            }
        }
        activityFeed.push("Skill scores updated");
        toast("✅ Skill scores saved and analysed!");
    }

    static void viewSkillGaps() {
        cls(); header("SKILL GAPS & IMPROVEMENT SUGGESTIONS");
        List<int[]> gaps = detectGaps();
        if (gaps.isEmpty()) {
            println();
            println("  " + GREEN + BOLD + "✅ No skill gaps detected! All skills above 60%." + RESET);
            println("  " + GREEN + "Keep up the great work and aim for 80%+ on all subjects." + RESET);
        } else {
            println("  " + RED + BOLD + gaps.size() + " gap(s) detected:" + RESET);
            for (int[] g : gaps) {
                int i = g[0];
                int score = g[1];
                int target = SKILL_TARGETS[i];
                println();
                println("  ┌─────────────────────────────────────────────────────┐");
                printf("  │ " + RED + BOLD + "%-10s" + RESET + " — %d%% (target: %d%%, deficit: -%d%%)           │%n",
                    SKILL_NAMES[i], score, target, target - score);
                println("  │ Progress: " + padRight("", 5));
                print("  │  "); miniBar(score, 45); println(" │");
                println("  ├─────────────────────────────────────────────────────┤");
                println("  │ " + YELLOW + BOLD + "Recommended Actions:" + RESET);
                for (String s : SKILL_SUGGESTIONS[i])
                    println("  │   → " + s);
                println("  │ " + CYAN + BOLD + "Learning Resources:" + RESET);
                for (String r : SKILL_RESOURCES[i])
                    println("  │   📚 " + r);
                println("  └─────────────────────────────────────────────────────┘");
            }
        }
        println();
        // Show strong skills
        println("  " + GREEN + "Strong Skills (≥80%):" + RESET);
        boolean any = false;
        for (String name : SKILL_NAMES) {
            int sc2 = skillScores.getOrDefault(name, 0);
            if (sc2 >= 80) { print("  " + GREEN + "● " + name + " " + sc2 + "%" + RESET + "  "); any = true; }
        }
        if (!any) print("  " + DIM + "None yet — keep studying!" + RESET);
        println(); println();
        pressEnter();
    }

    static void renderRadarChart() {
        cls(); header("SKILL RADAR CHART  (ASCII)");
        println();
        String[] labels = SKILL_NAMES;
        println("       " + CYAN + labels[1] + " (Web Dev)" + RESET);
        println("         100%");
        println("          |");
        for (int row = 10; row >= 0; row--) {
            int pct = row * 10;
            print(pct == 0 ? "  0% " : (pct < 100 ? "     " : "100% "));
            String bar = "";
            for (int i = 0; i < SKILL_NAMES.length; i++) {
                int score = skillScores.getOrDefault(SKILL_NAMES[i], 0);
                boolean filled = score >= pct;
                String col = score < 60 ? RED : score >= 80 ? GREEN : YELLOW;
                bar += (filled ? col + "█" + RESET : DIM + "░" + RESET) + " ";
            }
            println(bar);
        }
        print("      ");
        for (String n : SKILL_NAMES) print(CYAN + String.format("%-8s", n.substring(0,Math.min(6,n.length()))) + RESET + " ");
        println();
        println();
        println("  " + GREEN + "█" + RESET + " Score    " + DIM + "░" + RESET + " Gap  |  " + GREEN + "■ ≥80% (Strong)  " + RESET + YELLOW + "■ 60-79% (OK)  " + RESET + RED + "■ <60% (Gap)" + RESET);
        println();
        pressEnter();
    }

    static List<int[]> detectGaps() {
        List<int[]> gaps = new ArrayList<>();
        for (int i = 0; i < SKILL_NAMES.length; i++) {
            int score = skillScores.getOrDefault(SKILL_NAMES[i], 0);
            if (score < 60) gaps.add(new int[]{i, score});
        }
        return gaps;
    }

    // ── 7. ADMIN PANEL ─────────────────────────────────────────

    static void adminPanel() {
        while (true) {
            cls();
            header("ADMIN PANEL");
            println();
            menuItem("1", "➕", "Add User");
            menuItem("2", "👥", "View Users");
            menuItem("3", "🗑️", "Remove User");
            menuItem("4", "📊", "Academic Overview");
            menuItem("5", "⚠️", "Skill Gap Monitor");
            menuItem("6", "🔬", "Project Completion Report");
            menuItem("0", "⬅️", "Back");
            println(); print(CYAN + "  ▶ Choice: " + RESET);
            switch (sc.nextLine().trim()) {
                case "1" -> addUser();
                case "2" -> viewUsers();
                case "3" -> removeUser();
                case "4" -> academicOverview();
                case "5" -> skillGapMonitor();
                case "6" -> projectReport();
                case "0" -> { return; }
                default  -> toast("Invalid option.");
            }
        }
    }

    static void addUser() {
        cls(); header("ADD USER");
        String name = prompt("Full name");
        if (name.isEmpty()) { toast("Name cannot be empty."); return; }
        String role = promptMenu("Role", new String[]{"Student","Teacher","Admin"});
        users.add(new User(name, role));
        activityFeed.push("User added: " + name + " (" + role + ")");
        toast("✓ User \"" + name + "\" added!");
    }

    static void viewUsers() {
        cls(); header("USER LIST");
        if (users.isEmpty()) { println("  " + DIM + "No users." + RESET); pressEnter(); return; }
        println();
        println("  " + BOLD + String.format("%-4s %-28s %-12s", "ID","Name","Role") + RESET);
        println("  " + "─".repeat(48));
        for (User u : users)
            printf("  %-4d %-28s %-12s%n", u.id, u.name, u.role);
        println(); pressEnter();
    }

    static void removeUser() {
        viewUsers();
        print(CYAN + "  Enter User ID to remove: " + RESET);
        int id = readInt();
        boolean removed = users.removeIf(u -> u.id == id);
        if (removed) toast("✓ User removed."); else toast("User ID not found.");
    }

    static void academicOverview() {
        cls(); header("ACADEMIC OVERVIEW");
        long total = tasks.size(), done = tasks.stream().filter(t->t.status.equals("Completed")).count();
        int pct = total > 0 ? (int)(done * 100 / total) : 0;
        println();
        println("  " + BOLD + "── Task Statistics ──" + RESET);
        printf("  Total Tasks:       %d%n", total);
        printf("  Completed:         " + GREEN + "%d (%d%%)" + RESET + "%n", done, pct);
        printf("  Pending:           " + YELLOW + "%d%n" + RESET, total - done);
        printf("  Overdue:           " + RED + "%d%n" + RESET, countOverdue());
        print("  Completion Rate:   "); progressBar(pct, 30); println(" " + pct + "%");
        println();
        println("  " + BOLD + "── Other Stats ──" + RESET);
        printf("  Events tracked:    %d%n", events.size());
        printf("  Roadmap nodes:     %d (Linked List)%n", roadmap.size);
        printf("  Projects:          %d%n", projects.size());
        printf("  Users:             %d%n", users.size());
        println(); pressEnter();
    }

    static void skillGapMonitor() {
        cls(); header("SKILL GAP MONITOR");
        List<int[]> gaps = detectGaps();
        println();
        if (gaps.isEmpty()) {
            println("  " + GREEN + BOLD + "✅ No skill gaps. All students performing well!" + RESET);
        } else {
            println("  " + RED + BOLD + gaps.size() + " gap(s) requiring attention:" + RESET);
            println();
            println("  " + BOLD + String.format("%-12s %-8s %-8s %-10s", "Subject","Score","Target","Deficit") + RESET);
            println("  " + "─".repeat(44));
            for (int[] g : gaps) {
                printf("  " + RED + "%-12s" + RESET + " %-8d %-8d " + RED + "-%d%%%n" + RESET,
                    SKILL_NAMES[g[0]], g[1], SKILL_TARGETS[g[0]], SKILL_TARGETS[g[0]] - g[1]);
            }
        }
        println(); pressEnter();
    }

    static void projectReport() {
        cls(); header("PROJECT COMPLETION REPORT");
        long tot = projects.size();
        long comp = projects.stream().filter(p->p.status.equals("Completed")).count();
        long inPr = projects.stream().filter(p->p.status.equals("In Progress")).count();
        long notSt= projects.stream().filter(p->p.status.equals("Not Started")).count();
        long ghPushed = projects.stream().filter(p->p.githubPushed).count();
        int pct = tot > 0 ? (int)(comp * 100 / tot) : 0;
        println();
        printf("  Total Projects:    %d%n", tot);
        printf("  Completed:         " + GREEN + "%d (%.0f%%)" + RESET + "%n", comp, tot>0?(comp*100.0/tot):0);
        printf("  In Progress:       " + CYAN + "%d%n" + RESET, inPr);
        printf("  Not Started:       " + DIM + "%d%n" + RESET, notSt);
        printf("  GitHub Pushed:     " + GREEN + "%d / %d%n" + RESET, ghPushed, comp);
        println();
        print("  Completion Rate:   "); progressBar(pct, 30); println(" " + pct + "%");
        println();
        println("  " + BOLD + "── Project List ──" + RESET);
        for (Project p : projects) {
            String col = p.status.equals("Completed") ? GREEN : p.status.equals("In Progress") ? CYAN : DIM;
            printf("  " + col + "%-25s" + RESET + " %-14s %s%n",
                p.name, p.status, p.githubPushed ? GREEN + "🐙 GitHub ✓" + RESET : "");
        }
        println(); pressEnter();
    }

    // ── 8. SMART REMINDERS (Queue-based Notifications) ────────

    static void smartReminders() {
        cls();
        header("SMART REMINDERS  [Queue — FIFO Notifications]");
        LocalDate today = LocalDate.now();
        int count = 0;

        // Tasks
        for (Task t : tasks) {
            if (t.status.equals("Completed") || t.dueDate.isEmpty()) continue;
            long days = ChronoUnit.DAYS.between(today, LocalDate.parse(t.dueDate));
            if (days < 0)    { notifications.enqueue("🔴 OVERDUE task: " + t.name + " (due " + t.dueDate + ")"); count++; }
            else if (days==0){ notifications.enqueue("🟡 Task due TODAY: " + t.name); count++; }
            else if (days<=3){ notifications.enqueue("🟠 Task due in " + days + "d: " + t.name); count++; }
        }
        // Projects
        for (Project p : projects) {
            if (p.status.equals("Completed") || p.targetDate.isEmpty()) continue;
            long days = ChronoUnit.DAYS.between(today, LocalDate.parse(p.targetDate));
            if (days < 0)    { notifications.enqueue("🔴 OVERDUE project: " + p.name); count++; }
            else if (days<=5){ notifications.enqueue("🟠 Project due in " + days + "d: " + p.name); count++; }
        }
        // Events
        for (Event e : events) {
            if (e.date.isEmpty()) continue;
            long days = ChronoUnit.DAYS.between(today, LocalDate.parse(e.date));
            if (days==0)     { notifications.enqueue("📅 Event TODAY: " + e.name); count++; }
            else if (days<=3){ notifications.enqueue("📅 Event in " + days + "d: " + e.name); count++; }
        }
        // Skill gaps
        for (int[] g : detectGaps()) {
            notifications.enqueue("🧠 Skill gap: " + SKILL_NAMES[g[0]] + " at " + g[1] + "% — below 60% threshold");
            count++;
        }
        // GitHub pending
        for (Project p : projects) {
            if (p.status.equals("Completed") && !p.githubPushed)
                notifications.enqueue("🐙 Push \"" + p.name + "\" to GitHub!");
        }

        println();
        println("  " + BOLD + "Notification Queue (FIFO — oldest first):" + RESET);
        println("  " + DIM + "Queue size: " + notifications.getAll().size() + RESET);
        println();
        if (notifications.isEmpty()) {
            println("  " + GREEN + "✅ All clear! No urgent reminders." + RESET);
        } else {
            int i = 1;
            for (String n : notifications.getAll()) {
                println("  " + CYAN + "[" + String.format("%2d", i++) + "]" + RESET + " " + n);
            }
        }
        println();
        toast("🔔 " + count + " new reminder(s) generated and queued!");
        pressEnter();
    }

    // ── HELPERS ────────────────────────────────────────────────

    static void renderUpcomingDeadlines(int limit) {
        LocalDate today = LocalDate.now();
        List<String> items = new ArrayList<>();
        for (Task t : tasks) {
            if (t.dueDate.isEmpty() || t.status.equals("Completed")) continue;
            long days = ChronoUnit.DAYS.between(today, LocalDate.parse(t.dueDate));
            if (days <= 7) items.add(String.format("  📌 %-28s  %s  %s", truncate(t.name, 27), t.dueDate, daysLabel(days)));
        }
        for (Event e : events) {
            if (e.date.isEmpty()) continue;
            long days = ChronoUnit.DAYS.between(today, LocalDate.parse(e.date));
            if (days <= 7) items.add(String.format("  📅 %-28s  %s  %s", truncate(e.name, 27), e.date, daysLabel(days)));
        }
        if (items.isEmpty()) { println("  " + DIM + "No deadlines in the next 7 days 🎉" + RESET); return; }
        int shown = 0;
        for (String s : items) { if (shown++ >= limit) break; println(s); }
    }

    static long upcomingEventsCount(int days) {
        LocalDate today = LocalDate.now();
        return events.stream().filter(e -> !e.date.isEmpty() &&
            ChronoUnit.DAYS.between(today, LocalDate.parse(e.date)) <= days &&
            ChronoUnit.DAYS.between(today, LocalDate.parse(e.date)) >= 0).count();
    }

    static long countOverdue() {
        LocalDate today = LocalDate.now();
        return tasks.stream().filter(t -> !t.dueDate.isEmpty() && !t.status.equals("Completed") &&
            LocalDate.parse(t.dueDate).isBefore(today)).count();
    }

    static String daysLabel(long days) {
        if (days < 0) return RED + "OVERDUE" + RESET;
        if (days == 0) return YELLOW + BOLD + "TODAY" + RESET;
        if (days <= 3) return RED + days + "d left" + RESET;
        return GREEN + days + "d" + RESET;
    }

    static void showDashboardHeader() {
        println("  " + PURPLE + BOLD + "AcadMap" + RESET + DIM + " — Smart Academic Planning System  |  User: " + RESET + CYAN + currentUser + RESET + DIM + "  |  " + LocalDate.now() + RESET);
    }

    static void progressBar(int pct, int width) {
        int filled = (int)(width * pct / 100.0);
        print("[" + GREEN);
        for (int i = 0; i < width; i++) print(i < filled ? "█" : (RESET + DIM + "░" + RESET + GREEN));
        print(RESET + "]");
    }

    static void miniBar(int score, int width) {
        int filled = (int)(width * score / 100.0);
        String col = score < 60 ? RED : score >= 80 ? GREEN : YELLOW;
        print(col);
        for (int i = 0; i < width; i++) print(i < filled ? "█" : (RESET + DIM + "░" + RESET + col));
        print(RESET);
    }

    static void miniTarget(int score, int target, int width) {
        int targetPos = (int)(width * target / 100.0);
        for (int i = 0; i < width; i++) print(i == targetPos ? CYAN + "│" + RESET : " ");
    }

    static void header(String title) {
        int w = 56;
        println(PURPLE + BOLD + "  ╔" + "═".repeat(w) + "╗" + RESET);
        printf(PURPLE + BOLD + "  ║  %-" + (w-2) + "s║%n" + RESET, title);
        println(PURPLE + BOLD + "  ╚" + "═".repeat(w) + "╝" + RESET);
    }

    static void menuItem(String num, String icon, String label) {
        println("  " + CYAN + "[" + num + "]" + RESET + " " + icon + "  " + label);
    }

    static void toast(String msg) { println("\n  " + YELLOW + "▸ " + msg + RESET); pause(900); }

    static void pressEnter() { print(DIM + "  Press Enter to continue…" + RESET); sc.nextLine(); }

    static void cls() { System.out.print("\033[H\033[2J"); System.out.flush(); }

    static void println(String s) { System.out.println(s); }
    static void println()         { System.out.println(); }
    static void print(String s)   { System.out.print(s); }
    static void printf(String f, Object... a) { System.out.printf(f, a); }

    static void pause(long ms) { try { Thread.sleep(ms); } catch (Exception ignored) {} }

    static String prompt(String label) {
        print(CYAN + "  " + label + ": " + RESET);
        return sc.nextLine().trim();
    }

    static String promptDate(String label) {
        while (true) {
            print(CYAN + "  " + label + ": " + RESET);
            String s = sc.nextLine().trim();
            if (s.isEmpty()) return "";
            try { LocalDate.parse(s); return s; }
            catch (Exception e) { println(RED + "  Invalid date format. Use YYYY-MM-DD." + RESET); }
        }
    }

    static String promptMenu(String label, String[] options) {
        println("  " + BOLD + label + ":" + RESET);
        for (int i = 0; i < options.length; i++)
            println("    " + CYAN + (i+1) + ")" + RESET + " " + options[i]);
        while (true) {
            print("  Choice [1-" + options.length + "]: ");
            String s = sc.nextLine().trim();
            try {
                int idx = Integer.parseInt(s) - 1;
                if (idx >= 0 && idx < options.length) return options[idx];
            } catch (Exception ignored) {}
            println(RED + "  Invalid choice." + RESET);
        }
    }

    static int readInt() {
        try { return Integer.parseInt(sc.nextLine().trim()); }
        catch (Exception e) { return -1; }
    }

    static String truncate(String s, int max) {
        return s.length() > max ? s.substring(0, max - 1) + "…" : s;
    }

    static String padRight(String s, int n) {
        return String.format("%-" + n + "s", s);
    }
}
