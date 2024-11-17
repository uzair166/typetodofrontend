import { SignIn, useAuth } from "@clerk/clerk-react";
import TodoList from "./components/TodoList";

function App() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SignIn />
      </div>
    );
  }

  return (
    <>
      {/* <EnhancedTodoAppComponent /> */}
      <TodoList />
    </>
  );
}

export default App;
