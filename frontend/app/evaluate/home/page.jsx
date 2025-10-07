"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import Link from "next/link";

export default function EvaluationDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
    }

    const getData = async () => {
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

        const [userData, courseData] = await Promise.all([
          userRes.json(),
          courseRes.json(),
        ]);

        setUsers(userData);
        setCourses(courseData);
      } catch (error) {
        toast.error(error.message);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    if (users) {
      const getEvals = async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval/examiner/${
            users.find((el) => el.Email === mail)?._id
          }`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();

          setEvals(data);
        }
      };

      getEvals();
    }
  }, [users]);

  const handleCardClick = (id) => {
    router.push(`/evaluate/${id}`);
  };

  const getProgressPercentage = (progress) => {
    return (progress.checked / progress.uploaded) * 100;
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short" };
    return new Date(
      dateString.split("-").reverse().join("-")
    ).toLocaleDateString("en-US", options);
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Evaluations</h1>
          <p className="text-xs text-gray-500 mt-1">
            Your assigned evaluation tasks
          </p>
        </div>
        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="border border-gray-200 rounded-md p-3 bg-white shadow-sm"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="h-1.5 bg-gray-200 rounded-full w-full mb-1.5"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto">
      {evals.length === 0 ? (
        <div className="p-6 bg-white rounded-md border border-gray-200 text-center">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No evaluations assigned
          </h3>
          <p className="text-xs text-gray-500">
            You don't have any evaluation tasks at the moment.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4">
          {evals.map((evaluation) => (
            <Link
              key={evaluation._id}
              href={`/evaluate/home/check/${evaluation._id}`}
            >
              <div
                key={evaluation.id}
                className="border border-gray-200 rounded-md p-3 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700 line-clamp-1">
                    {evaluation.name}
                  </h3>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                    Sem {evaluation.semester}
                  </span>
                </div>

                <p className="text-xs text-gray-600 w-1/2 mb-3 line-clamp-2">
                  {courses?.length > 0 &&
                    courses.find((el) => evaluation.course === el.uuid).name}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Due: {formatDate(evaluation.endDate)}</span>
                  <span>
                    {evaluation.progress.checked}/{evaluation.progress.uploaded}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                  <div
                    className="bg-gray-800 h-1.5 rounded-full"
                    style={{
                      width: `${getProgressPercentage(evaluation.progress)}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {Math.round(getProgressPercentage(evaluation.progress))}%
                    complete
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-gray-600">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Mock data
const EVALS = [
  {
    id: 1,
    name: "French - Level 1",
    semester: "2",
    specialization: "Language Studies",
    endDate: "31-04-2025",
    course:
      "Bachelor in Business Administration (Professional Accountancy & Financial Management)",
    progress: {
      uploaded: 5,
      checked: 3,
    },
  },
  {
    id: 2,
    name: "Mathematics - Advanced",
    semester: "3",
    specialization: "Engineering",
    endDate: "15-05-2025",
    course: "Bachelor of Science in Mechanical Engineering",
    progress: {
      uploaded: 8,
      checked: 8,
    },
  },
  {
    id: 3,
    name: "Business Ethics",
    semester: "4",
    specialization: null,
    endDate: "10-04-2025",
    course:
      "Bachelor in Business Administration with focus on Corporate Governance",
    progress: {
      uploaded: 12,
      checked: 0,
    },
  },
  {
    id: 4,
    name: "Computer Science",
    semester: "1",
    specialization: "Software Engineering",
    endDate: "20-05-2025",
    course: "Bachelor of Computer Science",
    progress: {
      uploaded: 10,
      checked: 7,
    },
  },
  {
    id: 5,
    name: "Literature Review",
    semester: "2",
    specialization: "English",
    endDate: "05-05-2025",
    course: "Bachelor of Arts in English Literature",
    progress: {
      uploaded: 6,
      checked: 6,
    },
  },
  {
    id: 6,
    name: "Statistical Analysis",
    semester: "3",
    specialization: "Data Science",
    endDate: "25-04-2025",
    course: "Bachelor of Science in Data Analytics",
    progress: {
      uploaded: 15,
      checked: 5,
    },
  },
];
