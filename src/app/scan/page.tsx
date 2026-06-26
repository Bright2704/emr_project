'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  ScanLine,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  X,
  Loader2,
  Settings2,
  Droplets,
  Scan,
  Stethoscope,
  Pill,
  ClipboardCheck,
  HeartPulse,
  FolderOpen,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useDataStore, useAuthStore } from '@/store';
import { formatDate, cn } from '@/lib/utils';

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuthStore();
  const {
    patients,
    visits,
    categories,
    searchPatients,
    getPatient,
    getVisitsByPatient,
    addDocument,
    addAuditLog,
  } = useDataStore();

  // Mock scanners data
  const availableScanners = [
    { id: 'scanner-1', name: 'MFP ห้องตรวจ 1', ip: '192.168.1.101', location: 'OPD ชั้น 1', status: 'online' },
    { id: 'scanner-2', name: 'MFP ห้องตรวจ 2', ip: '192.168.1.102', location: 'OPD ชั้น 2', status: 'online' },
    { id: 'scanner-3', name: 'MFP เวชระเบียน', ip: '192.168.1.103', location: 'เวชระเบียน', status: 'online' },
    { id: 'scanner-4', name: 'MFP ห้องฉุกเฉิน', ip: '192.168.1.104', location: 'ER', status: 'offline' },
  ];

  // State
  const [step, setStep] = useState<'search' | 'confirm' | 'upload' | 'preview' | 'success'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [selectedScanner, setSelectedScanner] = useState<string | null>(null);

  // Default scanner (persisted in localStorage)
  const [defaultScanner, setDefaultScanner] = useState<string | null>(null);

  // Load default scanner from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('defaultScanner');
    if (saved) {
      setDefaultScanner(saved);
    }
  }, []);

  // Get current scanner info
  const currentScanner = defaultScanner
    ? availableScanners.find(s => s.id === defaultScanner)
    : null;

  // Category icon helper
  const getCategoryIcon = (categoryId: string, size: number = 20) => {
    const icons: Record<string, React.ReactNode> = {
      'cat-1': <Droplets size={size} />,
      'cat-2': <Scan size={size} />,
      'cat-3': <Stethoscope size={size} />,
      'cat-4': <Pill size={size} />,
      'cat-5': <ClipboardCheck size={size} />,
      'cat-6': <HeartPulse size={size} />,
      'cat-7': <FolderOpen size={size} />,
    };
    return icons[categoryId] || <FileText size={size} />;
  };

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      'cat-1': 'text-red-500 bg-red-100',
      'cat-2': 'text-purple-500 bg-purple-100',
      'cat-3': 'text-blue-500 bg-blue-100',
      'cat-4': 'text-green-500 bg-green-100',
      'cat-5': 'text-orange-500 bg-orange-100',
      'cat-6': 'text-pink-500 bg-pink-100',
      'cat-7': 'text-gray-500 bg-gray-100',
    };
    return colors[categoryId] || 'text-gray-500 bg-gray-100';
  };

  // Check URL params
  useEffect(() => {
    const visitId = searchParams.get('visitId');
    if (visitId) {
      const visit = visits.find((v) => v.id === visitId);
      if (visit) {
        setSelectedPatient(visit.patientId);
        setSelectedVisit(visitId);
        setStep('upload');
      }
    }
  }, [searchParams, visits]);

  const searchedPatients = searchQuery ? searchPatients(searchQuery) : [];
  const patient = selectedPatient ? getPatient(selectedPatient) : null;
  const patientVisits = selectedPatient ? getVisitsByPatient(selectedPatient) : [];
  const selectedVisitData = selectedVisit ? visits.find((v) => v.id === selectedVisit) : null;

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatient(patientId);
    setStep('confirm');
  };

  const handleConfirmPatient = () => {
    if (patientVisits.length === 1) {
      setSelectedVisit(patientVisits[0].id);
    }
    setStep('upload');
  };

  const handleOpenScannerModal = () => {
    setSelectedScanner(defaultScanner);
    setShowScannerModal(true);
  };

  const handleScanWithScanner = async (scannerId: string) => {
    setIsScanning(true);

    // Simulate scanning from selected scanner
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Create mock scanned file
    const scanner = availableScanners.find(s => s.id === scannerId);
    const mockFile = new File(['mock pdf content'], `scan_${scanner?.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`, {
      type: 'application/pdf',
    });
    setUploadedFiles((prev) => [...prev, mockFile]);
    setIsScanning(false);
  };

  const handleScanClick = () => {
    // If default scanner is set and online, scan directly
    if (defaultScanner && currentScanner?.status === 'online') {
      handleScanWithScanner(defaultScanner);
    } else {
      // Otherwise show scanner selection modal
      handleOpenScannerModal();
    }
  };

  const handleScanFromModal = async () => {
    if (!selectedScanner) return;
    setShowScannerModal(false);
    handleScanWithScanner(selectedScanner);
  };

  const handleSetDefaultScanner = (scannerId: string) => {
    setDefaultScanner(scannerId);
    localStorage.setItem('defaultScanner', scannerId);
  };

  const handleClearDefaultScanner = () => {
    setDefaultScanner(null);
    localStorage.removeItem('defaultScanner');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    if (!selectedCategory || uploadedFiles.length === 0) return;
    setStep('preview');
  };

  const handleSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmUpload = () => {
    // Create documents
    uploadedFiles.forEach((file, index) => {
      const doc = addDocument({
        visitId: selectedVisit!,
        filePath: `/uploads/${selectedVisit}/${file.name}`,
        fileType: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.png') ? 'png' : 'jpg',
        categoryId: selectedCategory,
        status: 'active',
        uploadedBy: currentUser?.id || '',
      });

      addAuditLog({
        userId: currentUser?.id || '',
        action: 'upload',
        targetType: 'document',
        targetId: doc.id,
        detail: {
          visitId: selectedVisit,
          fileName: file.name,
          category: selectedCategory,
        },
      });
    });

    setShowConfirmModal(false);
    setStep('success');
  };

  const resetForm = () => {
    setStep('search');
    setSearchQuery('');
    setSelectedPatient(null);
    setSelectedVisit(null);
    setSelectedCategory('');
    setUploadedFiles([]);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">สแกน / อัปโหลดเอกสาร</h1>
          <p className="text-gray-500">สแกนหรืออัปโหลดเอกสารเข้าสู่ระบบ</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['ค้นหาผู้ป่วย', 'ยืนยันข้อมูล', 'อัปโหลด', 'ตรวจสอบ', 'เสร็จสิ้น'].map((label, index) => {
            const steps = ['search', 'confirm', 'upload', 'preview', 'success'];
            const currentIndex = steps.indexOf(step);
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-[#002d73] text-white'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {isComplete ? <CheckCircle size={20} /> : index + 1}
                  </div>
                  <span className={cn('text-xs mt-1', isActive ? 'text-[#002d73] font-medium' : 'text-gray-500')}>
                    {label}
                  </span>
                </div>
                {index < 4 && (
                  <div
                    className={cn(
                      'w-16 h-1 mx-2',
                      index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Search Patient */}
        {step === 'search' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800">ค้นหาผู้ป่วย</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="พิมพ์ HN, เลขบัตรประชาชน, หรือชื่อ-นามสกุล..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchedPatients.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {searchedPatients.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectPatient(p.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">{p.firstName} {p.lastName}</div>
                            <div className="text-sm text-gray-500">
                              {p.hn} • วันเกิด: {formatDate(p.dateOfBirth)}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          เลือก
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchedPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>ไม่พบผู้ป่วย</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push('/patients/new')}
                  >
                    ลงทะเบียนผู้ป่วยใหม่
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Step 2: Confirm Patient */}
        {step === 'confirm' && patient && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800">ยืนยันข้อมูลผู้ป่วย</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#002d73] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {patient.firstName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <div className="text-gray-600">
                      <span className="font-mono">{patient.hn}</span>
                      <span className="mx-2">•</span>
                      <span>วันเกิด: {formatDate(patient.dateOfBirth)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 py-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={24} />
                  <span className="font-medium">ข้อมูลถูกต้อง?</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConfirmPatient} className="flex-1">
                  ยืนยัน ดำเนินการต่อ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPatient(null);
                    setStep('search');
                  }}
                >
                  ไม่ใช่ กลับไปค้นหา
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Step 3: Upload */}
        {step === 'upload' && patient && (
          <div className="space-y-6">
            {/* Patient Info Bar */}
            <Card>
              <CardBody className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-gray-500" />
                    <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                    <Badge>{patient.hn}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep('search')}>
                    เปลี่ยนผู้ป่วย
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Select Visit */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-800">เลือกการรับบริการ</h2>
              </CardHeader>
              <CardBody>
                {patientVisits.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {patientVisits.map((visit) => (
                      <div
                        key={visit.id}
                        className={cn(
                          'p-4 border rounded-lg cursor-pointer transition-colors',
                          selectedVisit === visit.id
                            ? 'border-[#002d73] bg-blue-50'
                            : 'hover:bg-gray-50'
                        )}
                        onClick={() => setSelectedVisit(visit.id)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="font-mono font-medium">{visit.visitNo}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(visit.visitDate)} •{' '}
                          <Badge variant={visit.visitType === 'OPD' ? 'info' : 'warning'} className="text-xs">
                            {visit.visitType}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>ยังไม่มีการรับบริการ</p>
                    <Button
                      onClick={() => router.push(`/visits?patientId=${patient.id}&createNew=true`)}
                      className="mt-4"
                    >
                      สร้างการรับบริการใหม่
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>

            {selectedVisit && (
              <>
                {/* Scan/Upload Area */}
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-800">สแกน / อัปโหลด</h2>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Scan Button */}
                      <div className="space-y-2">
                        <button
                          onClick={handleScanClick}
                          disabled={isScanning}
                          className={cn(
                            'w-full p-8 border-2 border-dashed rounded-lg text-center transition-colors',
                            isScanning
                              ? 'border-[#002d73] bg-blue-50'
                              : 'border-gray-300 hover:border-[#002d73] hover:bg-gray-50'
                          )}
                        >
                          {isScanning ? (
                            <>
                              <Loader2 size={48} className="mx-auto mb-3 text-[#002d73] animate-spin" />
                              <p className="font-medium text-[#002d73]">กำลังสแกน...</p>
                              <p className="text-sm text-gray-500">
                                {currentScanner ? currentScanner.name : 'กรุณารอสักครู่'}
                              </p>
                            </>
                          ) : (
                            <>
                              <ScanLine size={48} className="mx-auto mb-3 text-gray-400" />
                              <p className="font-medium text-gray-700">สแกนเอกสาร</p>
                              <p className="text-sm text-gray-500">
                                {currentScanner ? currentScanner.name : 'กดเพื่อเลือกเครื่องสแกน'}
                              </p>
                            </>
                          )}
                        </button>
                        {/* Scanner settings link */}
                        {!isScanning && (
                          <button
                            onClick={handleOpenScannerModal}
                            className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-[#002d73] transition-colors"
                          >
                            <Settings2 size={14} />
                            {currentScanner ? 'เปลี่ยนเครื่องสแกน' : 'ตั้งค่าเครื่องสแกน'}
                          </button>
                        )}
                      </div>

                      {/* Upload Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-8 border-2 border-dashed rounded-lg text-center border-gray-300 hover:border-[#002d73] hover:bg-gray-50 transition-colors"
                      >
                        <Upload size={48} className="mx-auto mb-3 text-gray-400" />
                        <p className="font-medium text-gray-700">อัปโหลดไฟล์</p>
                        <p className="text-sm text-gray-500">PDF, PNG, JPG</p>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium text-gray-700">ไฟล์ที่เลือก ({uploadedFiles.length})</p>
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText size={20} className="text-[#002d73]" />
                              <span>{file.name}</span>
                              <span className="text-sm text-gray-500">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Category Selection */}
                {uploadedFiles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold text-gray-800">เลือกหมวดหมู่เอกสาร</h2>
                    </CardHeader>
                    <CardBody>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {categories.filter((c) => c.isActive).map((category) => {
                          const isSelected = selectedCategory === category.id;

                          const borderColorMap: Record<string, string> = {
                            'cat-1': 'border-red-200 hover:border-red-400',
                            'cat-2': 'border-purple-200 hover:border-purple-400',
                            'cat-3': 'border-blue-200 hover:border-blue-400',
                            'cat-4': 'border-green-200 hover:border-green-400',
                            'cat-5': 'border-orange-200 hover:border-orange-400',
                            'cat-6': 'border-pink-200 hover:border-pink-400',
                            'cat-7': 'border-gray-200 hover:border-gray-400',
                          };

                          return (
                            <button
                              key={category.id}
                              onClick={() => setSelectedCategory(category.id)}
                              className={cn(
                                'p-4 border-2 rounded-xl text-center transition-all active:scale-95',
                                isSelected
                                  ? 'border-[#002d73] bg-blue-50 ring-2 ring-[#002d73] ring-offset-2'
                                  : `bg-white ${borderColorMap[category.id] || 'border-gray-200 hover:border-gray-400'}`
                              )}
                            >
                              <div className={cn(
                                'w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center',
                                isSelected ? 'bg-[#002d73] text-white' : getCategoryColor(category.id)
                              )}>
                                {getCategoryIcon(category.id, 28)}
                              </div>
                              <p className={cn(
                                'text-sm font-medium leading-tight',
                                isSelected ? 'text-[#002d73]' : 'text-gray-700'
                              )}>
                                {category.name}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={handlePreview}
                          className="flex-1"
                          disabled={!selectedCategory}
                        >
                          ตรวจสอบก่อนบันทึก
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 'preview' && patient && selectedVisitData && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800">ตรวจสอบก่อนบันทึก</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-yellow-800">กรุณาตรวจสอบข้อมูลให้ถูกต้อง</p>
                    <p className="text-sm text-yellow-700">
                      เมื่อบันทึกแล้วจะไม่สามารถแก้ไขได้โดยตรง ต้องติดต่อเวชระเบียน
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">ผู้ป่วย:</span>
                  <span className="font-medium">
                    {patient.firstName} {patient.lastName} ({patient.hn})
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">การรับบริการ:</span>
                  <span className="font-medium">{selectedVisitData.visitNo}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">วันที่รับบริการ:</span>
                  <span className="font-medium">{formatDate(selectedVisitData.visitDate)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500">หมวดเอกสาร:</span>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      getCategoryColor(selectedCategory)
                    )}>
                      {getCategoryIcon(selectedCategory, 16)}
                    </div>
                    <span className="font-medium">
                      {categories.find((c) => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">จำนวนไฟล์:</span>
                  <span className="font-medium">{uploadedFiles.length} ไฟล์</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSubmit} className="flex-1">
                  ยืนยันและบันทึก
                </Button>
                <Button variant="outline" onClick={() => setStep('upload')}>
                  กลับแก้ไข
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <Card>
            <CardBody className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">บันทึกสำเร็จ!</h2>
              <p className="text-gray-500 mb-6">
                อัปโหลดเอกสาร {uploadedFiles.length} ไฟล์เรียบร้อยแล้ว
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={resetForm}>
                  อัปโหลดเอกสารเพิ่ม
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/visits/${selectedVisit}`)}
                >
                  ดูการรับบริการ
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="ยืนยันการบันทึก"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            คุณต้องการบันทึกเอกสาร {uploadedFiles.length} ไฟล์ใช่หรือไม่?
          </p>
          <div className="flex gap-3">
            <Button onClick={handleConfirmUpload} className="flex-1">
              ยืนยัน
            </Button>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              ยกเลิก
            </Button>
          </div>
        </div>
      </Modal>

      {/* Scanner Selection Modal */}
      <Modal
        isOpen={showScannerModal}
        onClose={() => {
          setShowScannerModal(false);
          setSelectedScanner(null);
        }}
        title="ตั้งค่าเครื่องสแกน"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            เลือกเครื่องสแกนที่ต้องการใช้งานเป็นค่าเริ่มต้น
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {availableScanners.map((scanner) => (
              <div
                key={scanner.id}
                onClick={() => scanner.status === 'online' && setSelectedScanner(scanner.id)}
                className={cn(
                  'p-4 border rounded-lg transition-colors',
                  scanner.status === 'offline'
                    ? 'bg-gray-50 opacity-60 cursor-not-allowed'
                    : selectedScanner === scanner.id
                    ? 'border-[#002d73] bg-blue-50 cursor-pointer'
                    : 'hover:bg-gray-50 cursor-pointer'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      scanner.status === 'online' ? 'bg-[#002d73]' : 'bg-gray-300'
                    )}>
                      <ScanLine size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{scanner.name}</span>
                        {defaultScanner === scanner.id && (
                          <Badge variant="info" className="text-xs">ค่าเริ่มต้น</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {scanner.location} • {scanner.ip}
                      </div>
                    </div>
                  </div>
                  <Badge variant={scanner.status === 'online' ? 'success' : 'default'}>
                    {scanner.status === 'online' ? 'พร้อมใช้งาน' : 'ออฟไลน์'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (selectedScanner) {
                    handleSetDefaultScanner(selectedScanner);
                    setShowScannerModal(false);
                  }
                }}
                className="flex-1"
                disabled={!selectedScanner}
              >
                บันทึกเป็นค่าเริ่มต้น
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowScannerModal(false);
                  setSelectedScanner(null);
                }}
              >
                ยกเลิก
              </Button>
            </div>
            {defaultScanner && (
              <button
                onClick={() => {
                  handleClearDefaultScanner();
                  setShowScannerModal(false);
                }}
                className="text-sm text-red-600 hover:underline"
              >
                ล้างค่าเริ่มต้น (เลือกเครื่องทุกครั้ง)
              </button>
            )}
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScanContent />
    </Suspense>
  );
}
