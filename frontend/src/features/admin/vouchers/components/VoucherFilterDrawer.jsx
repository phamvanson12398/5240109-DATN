import React, { useState, useEffect } from 'react';
import { 
    Drawer, 
    Box, 
    Typography, 
    IconButton, 
    Stack, 
    Divider, 
    FormGroup, 
    FormControlLabel, 
    Checkbox, 
    TextField, 
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputAdornment
} from '@mui/material';
import { 
    Close as CloseIcon, 
    ExpandMore as ExpandMoreIcon, 
    FilterAlt as FilterIcon,
    RestartAlt as ResetIcon
} from '@mui/icons-material';

const VoucherFilterDrawer = ({ open, onClose, currentFilters, onApply, onReset }) => {
    // State local để lưu các thay đổi tạm thời trước khi nhấn "Áp dụng"
    const [localFilters, setLocalFilters] = useState(currentFilters);

    // Đồng bộ state local khi currentFilters thay đổi hoặc khi mở Drawer
    useEffect(() => {
        if (open) {
            setLocalFilters(currentFilters);
        }
    }, [open, currentFilters]);

    const handleCheckboxToggle = (group, value) => {
        setLocalFilters(prev => {
            const currentList = prev[group];
            const newList = currentList.includes(value)
                ? currentList.filter(item => item !== value)
                : [...currentList, value];
            return { ...prev, [group]: newList };
        });
    };

    const handleInputChange = (field, value) => {
        setLocalFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleReset = () => {
        onReset();
        onClose();
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 420 }, bgcolor: '#fdfdfd' }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FilterIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Manrope', color: '#191c1d' }}>
                            Bộ lọc nâng cao
                        </Typography>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                    <Stack spacing={3}>
                        
                        {/* 1. Trạng thái Voucher */}
                        <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: '16px !important', overflow: 'hidden' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#191c1d' }}>Trạng thái mã giảm giá</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 0 }}>
                                <FormGroup>
                                    {[
                                        { label: 'Hoạt động', value: 'active' },
                                        { label: 'Sắp hết hạn', value: 'near_expired' },
                                        { label: 'Đã hết hạn', value: 'expired' },
                                        { label: 'Đã vô hiệu hóa', value: 'disabled' },
                                    ].map((status) => (
                                        <FormControlLabel
                                            key={status.value}
                                            control={
                                                <Checkbox 
                                                    size="small"
                                                    checked={localFilters.status.includes(status.value)}
                                                    onChange={() => handleCheckboxToggle('status', status.value)}
                                                />
                                            }
                                            label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{status.label}</Typography>}
                                        />
                                    ))}
                                </FormGroup>
                            </AccordionDetails>
                        </Accordion>

                        {/* 2. Loại Voucher (Discount Type) */}
                        <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: '16px !important', overflow: 'hidden' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#191c1d' }}>Loại giảm giá</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 0 }}>
                                <FormGroup>
                                    {[
                                        { label: 'Giảm giá cố định (VND)', value: 'fixed' },
                                        { label: 'Giảm theo phần trăm (%)', value: 'percentage' },
                                        { label: 'Mã miễn phí vận chuyển', value: 'shipping' },
                                    ].map((type) => (
                                        <FormControlLabel
                                            key={type.value}
                                            control={
                                                <Checkbox 
                                                    size="small"
                                                    checked={localFilters.type.includes(type.value)}
                                                    onChange={() => handleCheckboxToggle('type', type.value)}
                                                />
                                            }
                                            label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{type.label}</Typography>}
                                        />
                                    ))}
                                </FormGroup>
                            </AccordionDetails>
                        </Accordion>

                        {/* 3. Giá trị Voucher (Range) */}
                        <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: '16px !important', overflow: 'hidden' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#191c1d' }}>Giá trị mã giảm giá (VNĐ)</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 0 }}>
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                    <TextField 
                                        label="Từ"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={localFilters.minAmount}
                                        onChange={(e) => handleInputChange('minAmount', e.target.value)}
                                        InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment> }}
                                    />
                                    <TextField 
                                        label="Đến"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={localFilters.maxAmount}
                                        onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                                        InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment> }}
                                    />
                                </Stack>
                            </AccordionDetails>
                        </Accordion>

                        {/* 4. Ngày tạo */}
                        <Accordion elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: '16px !important', overflow: 'hidden' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#191c1d' }}>Ngày tạo mã</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 0 }}>
                                <Stack spacing={2} sx={{ mt: 1 }}>
                                    <TextField 
                                        type="date"
                                        label="Từ ngày"
                                        size="small"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={localFilters.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                    />
                                    <TextField 
                                        type="date"
                                        label="Đến ngày"
                                        size="small"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={localFilters.endDate}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                    />
                                </Stack>
                            </AccordionDetails>
                        </Accordion>

                        {/* 5. Ngày hết hạn */}
                        <Accordion elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: '16px !important', overflow: 'hidden' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#191c1d' }}>Hạn sử dụng</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 0 }}>
                                <Stack spacing={2} sx={{ mt: 1 }}>
                                    <TextField 
                                        type="date"
                                        label="Từ ngày"
                                        size="small"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={localFilters.expiryStart}
                                        onChange={(e) => handleInputChange('expiryStart', e.target.value)}
                                    />
                                    <TextField 
                                        type="date"
                                        label="Đến ngày"
                                        size="small"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={localFilters.expiryEnd}
                                        onChange={(e) => handleInputChange('expiryEnd', e.target.value)}
                                    />
                                </Stack>
                            </AccordionDetails>
                        </Accordion>

                    </Stack>
                </Box>

                {/* Footer Buttons */}
                <Box sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #eee' }}>
                    <Stack spacing={2}>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={handleApply}
                            sx={{ 
                                bgcolor: '#004ac6', 
                                py: 1.5, 
                                borderRadius: '14px', 
                                fontWeight: 800,
                                textTransform: 'none',
                                boxSShadow: '0 8px 16px -4px rgba(0, 74, 198, 0.3)',
                                '&:hover': { bgcolor: '#003ea8' }
                            }}
                        >
                            Áp dụng bộ lọc
                        </Button>
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button 
                                startIcon={<ResetIcon />}
                                onClick={handleReset} 
                                sx={{ color: '#434655', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                            >
                                Xóa tất cả
                            </Button>
                            <Button 
                                onClick={onClose} 
                                sx={{ color: '#434655', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                            >
                                Hủy bỏ
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Box>
        </Drawer>
    );
};

export default VoucherFilterDrawer;
