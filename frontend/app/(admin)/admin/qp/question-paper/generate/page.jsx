'use client'

import React, { useState } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Upload, HomeIcon, Settings2, FileSpreadsheet, FileCheck, Loader2, Import, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export default function QPGeneratePage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [generationType, setGenerationType] = useState("without-questions");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
        } else {
            toast.error("Please select a valid PDF file");
            e.target.value = null;
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile) {
            toast.error("Please select a PDF file first");
            return;
        }

        setIsGenerating(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('generationType', generationType);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/process/question-paper`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process question paper');
            }

            const result = await response.json();
            toast.success("Question paper processed successfully!");
            
            // Optional: Download the generated Excel file if the backend returns it
            if (result.fileUrl) {
                window.open(result.fileUrl, '_blank');
            }

        } catch (error) {
            console.error('Error processing question paper:', error);
            toast.error(error.message || "Failed to generate Excel file");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImportRedirect = () => {
        // TODO: Implement navigation to import page
        toast.info("Redirecting to import page...");
    };

    return (
        <div className="flex flex-col w-full gap-6 p-6 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <div className="flex gap-1 justify-start items-center">
                    <SidebarTrigger className="mt-1 mb-1" />
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Generate Question Paper Excel
                    </h1>
                </div>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin" className="text-sm text-gray-600 hover:text-blue-600">
                                <HomeIcon className="h-4 w-4" />
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/qp" className="text-sm text-gray-600 hover:text-blue-600">
                                QP Management
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-sm text-blue-600">
                                Generate QP Excel
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className='h-full flex justify-center items-center'>
                {/* Main Content */}
                <Card className="max-w-2xl mx-auto w-full p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="space-y-8">
                        {/* Title */}
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold text-gray-800">Question Paper Generator</h2>
                            <p className="text-gray-500">Convert your PDF question papers into structured Excel format</p>
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Select Question Paper PDF File
                            </Label>
                            <div className="mt-2">
                                <label htmlFor="file-upload" className="cursor-pointer w-full block">
                                    <div 
                                        className={`relative flex items-center justify-center w-full border-2 border-dashed rounded-xl p-8
                                            ${selectedFile 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'} 
                                            transition-all duration-300 group`}
                                    >
                                        <div className="space-y-3 text-center">
                                            <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center
                                                ${selectedFile ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100'}
                                                transition-colors duration-300`}
                                            >
                                                <Upload className={`h-6 w-6 ${selectedFile ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-sm">
                                                    {selectedFile ? (
                                                        <div className="space-y-1">
                                                            <p className="text-blue-600 font-medium">{selectedFile.name}</p>
                                                            <p className="text-xs text-gray-500">Click to change file</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p className="font-medium text-gray-700">Drop your PDF file here or click to browse</p>
                                                            <p className="text-xs text-gray-500 mt-1">PDF files only</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Generation Options */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium flex items-center gap-2">
                                <Settings2 className="h-4 w-4" />
                                Select QP Creation Criteria
                            </Label>
                            <RadioGroup
                                value={generationType}
                                onValueChange={setGenerationType}
                                className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <div className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                                    ${generationType === 'without-questions' 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                                >
                                    <RadioGroupItem value="without-questions" id="without-questions" className="sr-only" />
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center
                                            ${generationType === 'without-questions' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            <FileSpreadsheet className={`h-4 w-4 ${generationType === 'without-questions' ? 'text-blue-600' : 'text-gray-500'}`} />
                                        </div>
                                        <Label htmlFor="without-questions" className="cursor-pointer">
                                            <div className="font-medium text-gray-700">Without Questions</div>
                                            <div className="text-xs text-gray-500">Generate Excel template only</div>
                                        </Label>
                                    </div>
                                </div>
                                <div className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                                    ${generationType === 'with-questions' 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                                >
                                    <RadioGroupItem value="with-questions" id="with-questions" className="sr-only" />
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center
                                            ${generationType === 'with-questions' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            <FileCheck className={`h-4 w-4 ${generationType === 'with-questions' ? 'text-blue-600' : 'text-gray-500'}`} />
                                        </div>
                                        <Label htmlFor="with-questions" className="cursor-pointer">
                                            <div className="font-medium text-gray-700">With Questions</div>
                                            <div className="text-xs text-gray-500">Include questions in Excel</div>
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <Button
                                onClick={handleGenerate}
                                disabled={!selectedFile || isGenerating}
                                className="w-full h-11 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 rounded-lg flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Generating Excel...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet className="h-4 w-4" />
                                        <span>Generate QP Excel</span>
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleImportRedirect}
                                variant="outline"
                                className="w-full h-11 hover:bg-gray-100 transition-colors duration-300 rounded-lg flex items-center justify-center gap-2"
                            >
                                <Import className="h-4 w-4" />
                                <span>Visit Import QP Page</span>
                            </Button>
                        </div>

                        {/* Processing Time Note */}
                        {selectedFile && (
                            <div className="flex items-center justify-center gap-2 text-gray-500">
                                <Clock className="h-4 w-4" />
                                <p className="text-sm">Estimated processing time: 2-3 minutes</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
