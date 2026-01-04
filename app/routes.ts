import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("grades", "routes/grades.tsx"),
  route("grades/:id", "routes/grades.$id.tsx"),
  route("class-exams", "routes/class-exams.tsx"),
  route("class-exams/:id", "routes/class-exams.$id.tsx"),
  route("tricks", "routes/tricks.tsx"),
  route("history", "routes/history.tsx"),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
