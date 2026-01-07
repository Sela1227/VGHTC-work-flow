import { useState, useRef } from 'react';
import importService from '../../services/importService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle,
  Download,
  X
} from 'lucide-react';

export default function ImportPage() {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: 上傳, 2: 預覽, 3: 結果
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setPreview(null);

    // 解析 CSV
    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);
      setParsedData(rows);

      // 預覽
      setLoading(true);
      const previewResult = await importService.preview(rows);
      setPreview(previewResult);
      setStep(2);
    } catch (error) {
      alert('檔案解析失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('檔案至少需要標題列和一筆資料');

    // 解析標題
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // 對應欄位名稱
    const fieldMap = {
      '病歷號': 'medical_record_no',
      'medical_record_no': 'medical_record_no',
      '案件類型': 'case_type_code',
      '類型': 'case_type_code',
      'case_type_code': 'case_type_code',
      '員工編號': 'employee_id',
      '處理者': 'employee_id',
      'employee_id': 'employee_id',
      '備註': 'note',
      'note': 'note',
    };

    const mappedHeaders = headers.map(h => fieldMap[h] || h);

    // 解析資料
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      mappedHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      if (row.medical_record_no) { // 只加入有病歷號的列
        rows.push(row);
      }
    }

    return rows;
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) return;

    setLoading(true);
    try {
      const importResult = await importService.execute(parsedData);
      setResult(importResult);
      setStep(3);
    } catch (error) {
      alert('匯入失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setPreview(null);
    setResult(null);
    setStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csv = '\uFEFF病歷號,案件類型,員工編號,備註\n12345678,A,E001,\n87654321,B,,急件';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '案件匯入範本.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">批次匯入案件</h1>
        <Button variant="secondary" onClick={downloadTemplate}>
          <Download size={18} className="mr-2" />
          下載範本
        </Button>
      </div>

      {/* 步驟指示 */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= s ? 'bg-sela-orange text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            <span className={`ml-2 ${step >= s ? 'text-gray-800' : 'text-gray-400'}`}>
              {s === 1 ? '上傳檔案' : s === 2 ? '預覽確認' : '匯入結果'}
            </span>
            {s < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-4" />}
          </div>
        ))}
      </div>

      {/* 步驟 1: 上傳 */}
      {step === 1 && (
        <Card>
          <div className="text-center py-12">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <FileSpreadsheet size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              選擇 CSV 檔案
            </h3>
            <p className="text-gray-500 mb-4">
              支援 CSV 格式，請先下載範本確認欄位格式
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} className="mr-2" />
              選擇檔案
            </Button>
          </div>

          {/* 說明 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">CSV 欄位說明</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>病歷號</strong>（必填）：患者病歷號</li>
              <li>• <strong>案件類型</strong>（必填）：A、B、C、D</li>
              <li>• <strong>員工編號</strong>（選填）：分配給指定同仁，留空則不分配</li>
              <li>• <strong>備註</strong>（選填）：案件備註</li>
            </ul>
          </div>
        </Card>
      )}

      {/* 步驟 2: 預覽 */}
      {step === 2 && preview && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">預覽結果</h3>
            <Button variant="secondary" size="sm" onClick={handleReset}>
              <X size={16} className="mr-1" />
              重新選擇
            </Button>
          </div>

          {/* 統計 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-green-600">{preview.valid}</p>
              <p className="text-sm text-green-600">有效筆數</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-red-600">{preview.invalid}</p>
              <p className="text-sm text-red-600">錯誤筆數</p>
            </div>
          </div>

          {/* 錯誤列表 */}
          {preview.errors?.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-700 mb-2">錯誤資料</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {preview.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>第 {err.row} 列：{err.errors.join(', ')}</li>
                ))}
                {preview.errors.length > 10 && (
                  <li>...還有 {preview.errors.length - 10} 筆錯誤</li>
                )}
              </ul>
            </div>
          )}

          {/* 預覽資料 */}
          {preview.preview?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">資料預覽（前 10 筆）</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-3">病歷號</th>
                      <th className="text-left py-2 px-3">案件類型</th>
                      <th className="text-left py-2 px-3">分配對象</th>
                      <th className="text-left py-2 px-3">備註</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2 px-3">{row.medical_record_no}</td>
                        <td className="py-2 px-3">{row.case_type_id}</td>
                        <td className="py-2 px-3">{row.assigned_to || '-'}</td>
                        <td className="py-2 px-3">{row.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleReset}>
              取消
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={loading || preview.valid === 0}
            >
              {loading ? '匯入中...' : `確認匯入 ${preview.valid} 筆`}
            </Button>
          </div>
        </Card>
      )}

      {/* 步驟 3: 結果 */}
      {step === 3 && result && (
        <Card>
          <div className="text-center py-8">
            {result.imported > 0 ? (
              <>
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  匯入完成！
                </h3>
                <p className="text-gray-600 mb-6">
                  成功匯入 <strong>{result.imported}</strong> 筆案件
                </p>
              </>
            ) : (
              <>
                <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  匯入失敗
                </h3>
                <p className="text-gray-600 mb-6">
                  請檢查資料格式後重試
                </p>
              </>
            )}
            <Button onClick={handleReset}>
              繼續匯入
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
