"use client";

import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { CheckCircle, Clock, Tag, Zap } from "lucide-react";

export function HomePageComponent() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="pt-16 pb-20 text-center lg:pt-24">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Organize your life with</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
              TypeToDo
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Boost your productivity and never miss a task again. TypeToDo helps
            you manage your tasks efficiently, so you can focus on what really
            matters.
          </p>
          <div className="mt-10 sm:flex sm:justify-center">
            <SignUpButton>
              <div className="rounded-md shadow">
                <a
                  href="#"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </a>
              </div>
            </SignUpButton>
            <SignInButton>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a
                  href="#"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 md:py-4 md:text-lg md:px-10"
                >
                  Log In
                </a>
              </div>
            </SignInButton>
          </div>
        </div>

        {/* Feature section */}
        <div className="py-16 bg-white dark:bg-gray-800 rounded-lg shadow-xl mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-violet-600 dark:text-violet-400 font-semibold tracking-wide uppercase">
                Features
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                A better way to manage tasks
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
                TypeToDo comes packed with features to help you stay organized
                and productive.
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-pink-500 to-violet-500 text-white">
                      <CheckCircle className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Task Management
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                    Easily create, edit, and complete tasks. Organize your
                    to-dos with a simple and intuitive interface.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-pink-500 to-violet-500 text-white">
                      <Tag className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Smart Tagging
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                    Use hashtags to categorize your tasks and filter them
                    easily. Find what you need in seconds.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-pink-500 to-violet-500 text-white">
                      <Clock className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Reminders
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                    Set reminders for important tasks and never miss a deadline.
                    Stay on top of your schedule effortlessly.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-pink-500 to-violet-500 text-white">
                      <Zap className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Productivity Insights
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                    Get insights into your productivity patterns and track your
                    progress over time.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="py-16">
          <div className="bg-violet-700 rounded-lg shadow-xl overflow-hidden">
            <div className="px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Ready to get started?</span>
                <span className="block">Sign up for free today.</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-violet-200">
                Join thousands of users who are already boosting their
                productivity with TypeToDo.
              </p>
              <a
                href="#"
                className="mt-8 bg-white border border-transparent rounded-md shadow px-5 py-3 inline-flex items-center text-base font-medium text-violet-600 hover:bg-violet-50"
              >
                Sign up for free
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
