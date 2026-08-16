---
name: endpoint-management
description: Create or update Axios endpoint modules for CRUD resources in this repository. Use when Codex needs to add, refactor, or standardize resource endpoint objects such as `list`, `post`, `put`, `get`, `patch`, and `delete`; wire DTOs and response types; serialize filters with shared utils; or keep endpoint files aligned with Cloudfy conventions.
---

# Endpoint Management

## Start Here

- Scan existing endpoint modules, DTOs, types, enums, and utils before adding anything new.
- Check for an existing utils file first when handling parsing, filtering, formatting, or query-string serialization.
- Reuse shared types and DTOs before creating new ones.
- Prefer enums over repeated hardcoded route segments when the same API path is used across multiple methods.
- Ask before implementing anything that comes from a `// TODO: ...` comment.

## Default Shape

- Group one resource in one object.
- Keep `AxiosInstance` as the first argument in every method.
- Return `response.data` or `response?.data` directly from the endpoint layer. Do not reshape payloads here unless the API contract requires it.
- Add only the verbs the API actually supports. Do not create placeholder methods.
- Use resource-specific id names such as `productId`, `orderId`, or `customerId`.

```ts
enum ProductRoute {
    Base = "/Products",
}

const product = {
    list: async (
        api: AxiosInstance,
        filter?: Partial<Filter>,
        signal?: AbortSignal,
    ): Promise<BasePagination<Product>> => {
        const response = await api.get(ProductRoute.Base, {
            params: filter,
            paramsSerializer: (params) => utils.group.stringURL(params),
            signal,
        });

        return response?.data;
    },
    post: async (
        api: AxiosInstance,
        data: CreateProductDTO,
    ): Promise<Product> => {
        const response = await api.post(ProductRoute.Base, data);
        return response?.data;
    },
    put: async (
        api: AxiosInstance,
        productId: number,
        data: UpdateProductDTO,
    ): Promise<Product> => {
        const response = await api.put(
            `${ProductRoute.Base}/${productId}`,
            data,
        );

        return response?.data;
    },
    get: async (
        api: AxiosInstance,
        productId: number,
        signal?: AbortSignal,
    ): Promise<Product> => {
        const response = await api.get(`${ProductRoute.Base}/${productId}`, {
            signal,
        });

        return response?.data;
    },
    patch: async (
        api: AxiosInstance,
        productId: number,
        data: PatchProductDTO,
    ): Promise<Product> => {
        const response = await api.patch(
            `${ProductRoute.Base}/${productId}`,
            data,
        );

        return response?.data;
    },
    delete: async (api: AxiosInstance, productId: number) => {
        const response = await api.delete(`${ProductRoute.Base}/${productId}`);

        return response?.data;
    },
};
```

## Method Rules

- Use `list` for collection reads and return paginated results when the API supports pagination, for example `Promise<BasePagination<Product>>`.
- Accept `filter?: Partial<Filter>` on list methods when the API supports query parameters.
- Pass `signal?: AbortSignal` through read methods that can be canceled, especially methods used by TanStack Query.
- Use `post` for create, `put` for full update, `patch` for partial update, `get` for single-resource fetch, and `delete` for removal.
- Keep request DTOs explicit: `Create...DTO`, `Update...DTO`, `Patch...DTO`.
- Keep response types explicit: resource models or shared wrappers such as `BasePagination<T>`.

## Query Params And Serialization

- Use axios `params` for filters instead of building query strings manually.
- Reuse the shared serializer utility when filters contain nested objects or arrays:
  `paramsSerializer: (params) => utils.group.stringURL(params)`.
- If the serializer utility does not exist in the target area, search the repo for an existing shared utility before creating one.

## Naming And Placement

- Match the surrounding endpoint export style. If nearby files export a grouped object, follow that pattern.
- Keep file and folder names in kebab-case.
- Keep resource, DTO, schema, and type names in PascalCase.
- Use arrow functions for every endpoint method.
- Prefer a nearby enum or shared enum for repeated route literals.

## Validation Checklist

- Confirm the route path matches the backend contract exactly.
- Confirm every method returns the typed `response.data`.
- Confirm list filters use the shared serializer when needed.
- Confirm read methods pass `signal` through when cancellation matters.
- Confirm no duplicate DTOs, types, enums, or utils were introduced.
- Confirm unsupported verbs were not added.
