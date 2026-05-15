import React, { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    Stack, 
    Typography,
    IconButton,
    Box
} from '@mui/material';
import { Close as CloseIcon, FileDownload as DownloadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

/**
 * VoucherExportRangeModal: Modal chọn khoảng thời gian để xuất Excel
 */
const VoucherExportRangeModal = ({ open, onClose, onConfirm }) => {
    const [range, setRange] = useState({
        startDate: '',
        endDate: ''
    });

    const handleConfirm = () => {
        if (!range.startDate || !range.endDate) {
            toast.warning('Vui lòng chọn đầy đủ từ ngày - đến ngày');
            return;
        }

        if (new Date(range.startDate) > new Date(range.endDate)) {
            toast.error('Ngày bắt đầu không được lớn hơn ngày kết thúc');
            return;
        }

        onConfirm(range);
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            PaperProps={{
                sx: { borderRadius: '20px', p: 1, maxWidth: '400px', width: '100%' }
            }}
        >
            <DialogTitle sx={{ p: 2, display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Manrope' }}>
                    Xuất theo thời gian
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                    Hệ thống sẽ lấy danh sách mã giảm giá được tạo trong khoảng thời gian này để xuất file .xlsx.
                </Typography>
                
                <Stack spacing={3}>
                    <TextField
                        label="Từ ngày"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={range.startDate}
                        onChange={(e) => setRange(p => ({ ...p, startDate: e.target.value }))}
                    />
                    <TextField
                        label="Đến ngày"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={range.endDate}
                        onChange={(e) => setRange(p => ({ ...p, endDate: e.target.value }))}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button 
                    onClick={onClose} 
                    sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                >
                    Hủy bỏ
                </Button>
                <Button 
                    variant="contained" 
                    onClick={handleConfirm}
                    startIcon={<DownloadIcon />}
                    sx={{ 
                        textTransform: 'none', 
                        fontWeight: 800, 
                        borderRadius: '10px',
                        bgcolor: '#004ac6',
                        '&:hover': { bgcolor: '#003ea8' }
                    }}
                >
                    Xác nhận xuất
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VoucherExportRangeModal;
