'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Lock,
  Download,
  Share2,
  Eye,
  Plus,
  Folder,
  Search,
  MoreVertical,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type DocumentCategory = 'Policies' | 'Certificates' | 'Audit Reports' | 'Evidence' | 'Contracts' | 'Credentials';
type AccessLevel = 'Public' | 'Internal' | 'Confidential' | 'Restricted';

interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  version: number;
  uploadedBy: string;
  uploadDate: string;
  size: number;
  accessLevel: AccessLevel;
}

const CATEGORIES: DocumentCategory[] = ['Policies', 'Certificates', 'Audit Reports', 'Evidence', 'Contracts', 'Credentials'];

const MOCK_DOCUMENTS: Document[] = [
  { id: '1', name: 'ISO 27001 Policy', category: 'Policies', version: 3, uploadedBy: 'John Smith', uploadDate: '2025-01-15', size: 2.4, accessLevel: 'Internal' },
  { id: '2', name: 'Data Processing Agreement', category: 'Contracts', version: 2, uploadedBy: 'Sarah Johnson', uploadDate: '2025-01-14', size: 1.8, accessLevel: 'Confidential' },
  { id: '3', name: 'Q4 2024 Audit Report', category: 'Audit Reports', version: 1, uploadedBy: 'Michael Chen', uploadDate: '2025-01-10', size: 5.6, accessLevel: 'Restricted' },
  { id: '4', name: 'SSL Certificate - prod.example.com', category: 'Certificates', version: 1, uploadedBy: 'DevOps Team', uploadDate: '2024-12-20', size: 0.05, accessLevel: 'Restricted' },
  { id: '5', name: 'GDPR Compliance Evidence', category: 'Evidence', version: 4, uploadedBy: 'Compliance Team', uploadDate: '2025-01-12', size: 3.2, accessLevel: 'Confidential' },
  { id: '6', name: 'AWS IAM Credentials Backup', category: 'Credentials', version: 1, uploadedBy: 'DevOps Team', uploadDate: '2025-01-08', size: 0.15, accessLevel: 'Restricted' },
  { id: '7', name: 'Incident Response Policy', category: 'Policies', version: 2, uploadedBy: 'Security Team', uploadDate: '2025-01-05', size: 1.2, accessLevel: 'Internal' },
  { id: '8', name: 'SOC 2 Type II Report', category: 'Audit Reports', version: 1, uploadedBy: 'Audit Manager', uploadDate: '2024-11-30', size: 8.9, accessLevel: 'Confidential' },
  { id: '9', name: 'PCI DSS Assessment', category: 'Audit Reports', version: 2, uploadedBy: 'Security Officer', uploadDate: '2025-01-02', size: 4.3, accessLevel: 'Restricted' },
  { id: '10', name: 'Access Control Matrix', category: 'Evidence', version: 3, uploadedBy: 'HR Department', uploadDate: '2025-01-09', size: 0.8, accessLevel: 'Confidential' },
  { id: '11', name: 'Vendor Security Agreement', category: 'Contracts', version: 1, uploadedBy: 'Legal Team', uploadDate: '2024-12-28', size: 2.1, accessLevel: 'Confidential' },
  { id: '12', name: 'Backup Encryption Certificate', category: 'Certificates', version: 2, uploadedBy: 'Infrastructure', uploadDate: '2025-01-11', size: 0.08, accessLevel: 'Restricted' },
  { id: '13', name: 'Risk Assessment Report 2025', category: 'Evidence', version: 1, uploadedBy: 'Risk Team', uploadDate: '2025-01-13', size: 6.4, accessLevel: 'Internal' },
  { id: '14', name: 'Third-Party Security Review', category: 'Audit Reports', version: 1, uploadedBy: 'External Auditor', uploadDate: '2024-12-15', size: 7.2, accessLevel: 'Confidential' },
  { id: '15', name: 'API Key Rotation Schedule', category: 'Credentials', version: 2, uploadedBy: 'DevOps Team', uploadDate: '2025-01-07', size: 0.2, accessLevel: 'Restricted' },
];

const getAccessLevelColor = (level: AccessLevel) => {
  switch (level) {
    case 'Restricted':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Confidential':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Internal':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Public':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
};

const getCategoryIcon = (category: DocumentCategory) => {
  const iconClass = 'w-4 h-4';
  switch (category) {
    case 'Policies':
      return <FileText className={iconClass} />;
    case 'Certificates':
      return <Lock className={iconClass} />;
    case 'Audit Reports':
      return <FileText className={iconClass} />;
    case 'Evidence':
      return <FileText className={iconClass} />;
    case 'Contracts':
      return <FileText className={iconClass} />;
    case 'Credentials':
      return <Lock className={iconClass} />;
  }
};

export default function VaultPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'Policies' as DocumentCategory,
    accessLevel: 'Internal' as AccessLevel,
    fileType: 'pdf',
  });

  // Load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('vault_documents');
      setDocuments(stored ? JSON.parse(stored) : MOCK_DOCUMENTS);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter documents
  useEffect(() => {
    let filtered = documents;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((doc) => doc.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, selectedCategory, searchTerm]);

  const handleUpload = () => {
    if (!uploadForm.name.trim()) return;

    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: uploadForm.name,
      category: uploadForm.category,
      version: 1,
      uploadedBy: 'Current User',
      uploadDate: new Date().toISOString().split('T')[0],
      size: Math.random() * 10,
      accessLevel: uploadForm.accessLevel,
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    localStorage.setItem('vault_documents', JSON.stringify(updated));
    setShowUploadForm(false);
    setUploadForm({
      name: '',
      category: 'Policies',
      accessLevel: 'Internal',
      fileType: 'pdf',
    });
  };

  const handleDelete = (id: string) => {
    const updated = documents.filter((doc) => doc.id !== id);
    setDocuments(updated);
    localStorage.setItem('vault_documents', JSON.stringify(updated));
  };

  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
  const sharedCount = Math.floor(documents.length * 0.4);
  const pendingReviews = Math.floor(documents.length * 0.15);

  const categoryDocCount = (cat: DocumentCategory) => documents.filter((d) => d.category === cat).length;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 bg-slate-200 rounded-2xl w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Document Vault</h1>
          <p className="text-slate-500 text-sm mt-1">Secure storage for sensitive documents and credentials</p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-2xl hover:bg-sky-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
                <p className="text-sm text-slate-600">Total Documents</p>
              </div>
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalSize.toFixed(1)} MB</p>
                <p className="text-sm text-slate-600">Storage Used</p>
              </div>
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{sharedCount}</p>
                <p className="text-sm text-slate-600">Shared Documents</p>
              </div>
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                <Share2 className="w-6 h-6 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingReviews}</p>
                <p className="text-sm text-slate-600">Pending Reviews</p>
              </div>
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Folder Tree */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategory === 'All'
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm font-medium">All Documents</span>
                <span className="text-xs text-slate-500">{documents.length}</span>
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    <span className="text-sm font-medium">{cat}</span>
                  </div>
                  <span className="text-xs text-slate-500">{categoryDocCount(cat)}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Upload Form */}
          {showUploadForm && (
            <Card className="border-slate-200/60 shadow-sm bg-sky-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Upload Document</h3>
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Document Name</label>
                    <input
                      type="text"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                      placeholder="e.g., ISO 27001 Policy v2"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Category</label>
                      <select
                        value={uploadForm.category}
                        onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as DocumentCategory })}
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Access Level</label>
                      <select
                        value={uploadForm.accessLevel}
                        onChange={(e) => setUploadForm({ ...uploadForm, accessLevel: e.target.value as AccessLevel })}
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Public">Public</option>
                        <option value="Internal">Internal</option>
                        <option value="Confidential">Confidential</option>
                        <option value="Restricted">Restricted</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleUpload}
                      disabled={!uploadForm.name.trim()}
                      className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => setShowUploadForm(false)}
                      className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>

          {/* Documents Table */}
          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Version</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Access Level</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{doc.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                          {getCategoryIcon(doc.category)}
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">v{doc.version}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{doc.uploadedBy}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{doc.uploadDate}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{doc.size.toFixed(2)} MB</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getAccessLevelColor(
                            doc.accessLevel
                          )}`}
                        >
                          {doc.accessLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            title="View"
                            className="p-1 hover:bg-sky-50 rounded-lg transition-colors text-sky-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Download"
                            className="p-1 hover:bg-sky-50 rounded-lg transition-colors text-sky-600"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            title="Share"
                            className="p-1 hover:bg-sky-50 rounded-lg transition-colors text-sky-600"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            title="Delete"
                            className="p-1 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No documents found</p>
                <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
