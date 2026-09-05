import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AccessibilityProvider } from "./components/AccessibilityContext";
import { OperatorProvider } from "./components/OperatorContext";

export default function App() {
  return (
    <AccessibilityProvider>
      <OperatorProvider>
        <RouterProvider router={router} />
      </OperatorProvider>
    </AccessibilityProvider>
  );
}
