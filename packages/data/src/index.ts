/**
 * Shared API / data-layer primitives for the Ọjà platform.
 *
 * Provides a typed HTTP client factory, pagination/error response types,
 * and a react-query factory that standardizes query keys, list queries,
 * and mutations across both the admin dashboard and the storefront.
 */

export * from "./types";
export * from "./client";
export * from "./query-factory";
