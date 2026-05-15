import { createSelector } from '@reduxjs/toolkit';

const selectAdminState = (state) => state.admin;

export const selectAdminLoading = (state) => selectAdminState(state).loading;

export const selectAdminError = (state) => selectAdminState(state).error;

export const selectAdminGlobalSearchQuery = (state) =>
    selectAdminState(state).globalSearchQuery;

const selectAdminStats = (state) => selectAdminState(state).stats;
const selectAdminRecentOrders = (state) => selectAdminState(state).recentOrders;
const selectAdminRevenueAnalytics = (state) =>
    selectAdminState(state).revenueAnalytics;
const selectAdminProductsList = (state) => selectAdminState(state).products;
const selectAdminProductSearchResults = (state) =>
    selectAdminState(state).searchResults;
const selectAdminProductImportResult = (state) =>
    selectAdminState(state).importResult;
const selectAdminOrdersList = (state) => selectAdminState(state).orders;
const selectAdminUsersList = (state) => selectAdminState(state).users;
const selectAdminVouchersList = (state) => selectAdminState(state).vouchers;
const selectAdminTotalVouchers = (state) => selectAdminState(state).totalVouchers;
const selectAdminTotalPages = (state) => selectAdminState(state).totalPages;
const selectAdminCurrentPage = (state) => selectAdminState(state).currentPage;
const selectAdminSettingsData = (state) => selectAdminState(state).settings;

export const selectAdminDashboard = createSelector(
    [
        selectAdminStats,
        selectAdminRecentOrders,
        selectAdminRevenueAnalytics,
        selectAdminLoading,
        selectAdminError,
    ],
    (stats, recentOrders, revenueAnalytics, loading, error) => ({
        stats,
        recentOrders,
        revenueAnalytics,
        loading,
        error,
    })
);

export const selectAdminProducts = createSelector(
    [
        selectAdminProductsList,
        selectAdminProductSearchResults,
        selectAdminProductImportResult,
        selectAdminGlobalSearchQuery,
        selectAdminLoading,
        selectAdminError,
    ],
    (products, searchResults, importResult, globalSearchQuery, loading, error) => ({
        products,
        searchResults,
        importResult,
        globalSearchQuery,
        loading,
        error,
    })
);

export const selectAdminOrders = createSelector(
    [selectAdminOrdersList, selectAdminLoading, selectAdminError],
    (orders, loading, error) => ({
        orders,
        loading,
        error,
    })
);

export const selectAdminUsers = createSelector(
    [selectAdminUsersList, selectAdminLoading, selectAdminError],
    (users, loading, error) => ({
        users,
        loading,
        error,
    })
);

export const selectAdminVouchers = createSelector(
    [
        selectAdminVouchersList,
        selectAdminTotalVouchers,
        selectAdminTotalPages,
        selectAdminCurrentPage,
        selectAdminLoading,
        selectAdminError,
    ],
    (vouchers, totalVouchers, totalPages, currentPage, loading, error) => ({
        vouchers,
        totalVouchers,
        totalPages,
        currentPage,
        loading,
        error,
    })
);

export const selectAdminSettings = createSelector(
    [selectAdminSettingsData, selectAdminLoading, selectAdminError],
    (settings, loading, error) => ({
        settings,
        loading,
        error,
    })
);
