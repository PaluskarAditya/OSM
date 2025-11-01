"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import Link from "next/link";
import { Calendar, Clock, Users, ChevronRight, BookOpen, AlertCircle } from "lucide-react";

export default function EvaluationDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [mail, setMail] = useState("");
  const [token, setToken] = useState("");
  const [users, setUsers] = useState([]);
  const [evals, setEvals] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const mail = Cookies.get("mail");
    const token = Cookies.get("token");
    setMail(mail);
    setToken(token);

    if (!token) {
      router.push("/evaluate");
      return;
    }

    const getData = async () => {
      setIsLoading(true);
      try {
        const [userRes, courseRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!userRes.ok || !courseRes.ok) throw new Error("Failed to fetch data");

        const [userData, courseData] = await Promise.all([
          userRes.json(),
          courseRes.json(),
        ]);

        setUsers(userData);
        setCourses(courseData);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [router, token]);

  useEffect(() => {
    if (users.length > 0 && mail) {
      const getEvals = async () => {
        try {
          const examiner = users.find((el) => el.Email === mail);
          if (!examiner?._id) return;

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval/examiner/${examiner._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.ok) {
            const data = await res.json();
            setEvals(data);
          }
        } catch (error) {
          console.error("Error fetching evaluations:", error);
        }
      };

      getEvals();
    }
  }, [users, mail, token]);

  const getProgressPercentage = (progress) => {
    if (!progress.uploaded) return 0;
    return Math.round((progress.checked / progress.uploaded) * 100);
  };

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            My Evaluations
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Track and manage your assigned answer sheet evaluations
          </p>
        </div>

        {/* Empty State */}
        {evals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {evals.map((evaluation) => {
              const percentage = getProgressPercentage(evaluation.progress);
              const courseName = courses.find((el) => evaluation.course === el.uuid)?.name || "Unknown Course";
              const isOverdue = new Date(evaluation.endDate.split("-").reverse().join("-")) < new Date();

              return (
                <Link
                  key={evaluation._id}
                  href={`/evaluate/home/check/${evaluation._id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 p-5 h-full flex flex-col justify-between transform hover:-translate-y-1">
                    {/* Header */}
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                          {evaluation.name}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          Sem {evaluation.semester}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 mb-4">
                        {courseName}
                      </p>

                      {/* Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {evaluation.progress.checked}/{evaluation.progress.uploaded}
                          </span>
                          <span className={`font-medium ${percentage === 100 ? "text-green-600" : "text-gray-700"}`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            Due {formatDate(evaluation.endDate)}
                          </span>
                          {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="min-h-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="h-9 bg-gray-200 rounded-lg w-64 mb-3 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 animate-pulse"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded-full w-12"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full w-full"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Empty State
const EmptyState = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
    <div className="max-w-md mx-auto">
      <div className="bg-gray-100 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No evaluations assigned yet
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        You'll see your assigned answer sheet evaluation tasks here when they become available.
      </p>
      <div className="flex justify-center gap-2 text-xs text-gray-500">
        <Clock className="w-4 h-4" />
        <span>Check back later or contact your coordinator</span>
      </div>
    </div>
  </div>
);