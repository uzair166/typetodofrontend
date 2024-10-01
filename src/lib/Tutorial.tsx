import {
  EditIcon,
  GripVerticalIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  UndoIcon,
  XIcon,
} from "lucide-react";

export const tutorialSteps = [
  {
    title: "Welcome to TypeToDo!",
    content: (
      <p className="text-gray-700 dark:text-gray-300">
        This quick tour will guide you through the main features of the app.
      </p>
    ),
  },
  {
    title: "Add New Tasks",
    content: (
      <div className="text-gray-700 dark:text-gray-300">
        <p className="mb-4">Use the input box to add new tasks.</p>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Add a new task..."
            className="flex-grow px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled
          />
          <button
            type="button"
            className="px-4 py-2 rounded-r-md bg-gradient-to-r from-pink-500 to-violet-500 text-white h-[42px] flex items-center justify-center"
            disabled
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    ),
  },
  {
    title: "Edit Tasks",
    content: (
      <div className="text-gray-700 dark:text-gray-300">
        <p className="mb-4">Click on the edit icon to modify a task.</p>
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center flex-grow mr-4">
            <button className="mr-3 text-gray-400 dark:text-gray-300">
              <div className="w-6 h-6 border-2 border-current rounded-full" />
            </button>
            <span className="text-gray-700 dark:text-gray-200 flex-grow">
              Sample Task
            </span>
          </div>
          <div className="flex items-center">
            <button className="text-blue-500">
              <EditIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Reorder Tasks",
    content: (
      <div className="text-gray-700 dark:text-gray-300">
        <p className="mb-4">Drag and drop tasks to reorder them.</p>
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 cursor-move">
          <div className="flex items-center flex-grow mr-4">
            <GripVerticalIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-200 flex-grow">
              Sample Task
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Use Hashtags",
    content: (
      <div className="text-gray-700 dark:text-gray-300">
        <p className="mb-4">Use hashtags (e.g., #work) to tag tasks.</p>
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center flex-grow mr-4">
            <span className="text-gray-700 dark:text-gray-200 flex-grow">
              Finish the report by EOD #work
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Filter by Hashtags",
    content: (
      <div className="text-gray-700 dark:text-gray-300">
        <p className="mb-4">Click on hashtags to filter tasks.</p>
        <button className="text-blue-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          #work
        </button>
      </div>
    ),
  },
  {
    title: "Undo Actions",
    content: (
      <div className="text-gray-700 dark:text-gray-300">
        <p className="mb-4">Use the undo button or Ctrl+Z to undo actions.</p>
        <button className="text-gray-500 dark:text-gray-300">
          <UndoIcon className="w-6 h-6" />
        </button>
      </div>
    ),
  },
  {
    title: "Toggle Dark Mode",
    content: (
      <div className="text-gray-700 dark:text-gray-300">
        <p className="mb-4">Switch between light and dark mode.</p>
        <button className="text-gray-500 dark:text-gray-300">
          <SunIcon className="w-6 h-6" />
        </button>
        <span className="mx-2">or</span>
        <button className="text-gray-500 dark:text-gray-300">
          <MoonIcon className="w-6 h-6" />
        </button>
      </div>
    ),
  },
  {
    title: "All Set!",
    content: (
      <p className="text-gray-700 dark:text-gray-300">
        You're ready to start using the TypeToDo. Enjoy organizing your tasks!
      </p>
    ),
  },
];

export const Tutorial: React.FC<{
  setShowTutorial: (show: boolean) => void;
  tutorialStep: number;
  setTutorialStep: (step: number) => void;
}> = ({ setShowTutorial, tutorialStep, setTutorialStep }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-md max-w-lg w-full mx-4 relative">
        <button
          onClick={() => setShowTutorial(false)}
          className="absolute top-2 right-2 text-zinc-500 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-100"
          aria-label="Close tutorial"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
          {tutorialSteps[tutorialStep].title}
        </h2>
        {tutorialSteps[tutorialStep].content}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setTutorialStep(Math.max(tutorialStep - 1, 0))}
            disabled={tutorialStep === 0}
            className={`px-4 py-2 rounded-md ${
              tutorialStep === 0
                ? "bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:from-pink-600 hover:to-violet-600"
            } focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors`}
          >
            Previous
          </button>
          {tutorialStep < tutorialSteps.length - 1 ? (
            <button
              onClick={() => setTutorialStep(tutorialStep + 1)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-md hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setShowTutorial(false)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-md hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
