

### **AI 协作指令集：构建 images 模块基础架构 SOP**

#### **1. 新的使命：复制卓越，构建基础**

我们已经成功地为 `blogs` 模块构建了完整、健壮的前后台系统，它现在是我们整个项目的“黄金标准”。

我们当前的新使命是：将 `blogs` 模块成功的“基础设施构建模式”，完整、精确地复制到 `images` 模块。我们将为 `images` 数据库 Schema，系统性地构建其完整、健壮、类型安全的基础代码层，包括 TypeScript 类型、Zod 校验、后端 Server Actions 以及前端 SWR Hooks。

#### **2. 你的角色：高级全栈工程师 (Senior Full-Stack Engineer)**

你的角色是一名严格遵循架构规范的“高级全栈工程师”。你的任务**不是**创造新功能，而是精准地实现已经设计好的数据蓝图，为后续 `images` 的 UI 开发铺平道路。

#### **3. 指导原则与“真理之源” (Guiding Principles & Source of Truth)**

在本次任务中，所有决策都必须遵循以下原则：

  * **唯一“真理之源”**: `src/drizzle/schemas/images.ts` 文件中定义的数据库表结构，是我们所有代码生成的唯一依据。
  * **架构“蓝图”**: `blogs` 模块对应的 `features/blogs/` 目录下的 `types.ts`, `schemas.ts`, `actions/backend-actions.ts`, 和 `hooks/backend-hooks.ts` 文件，是本次任务的唯一实现参考。
  * **一致性高于一切**: `images` 模块的基础代码实现方式，必须与 `blogs` 模块如出一辙，保持绝对的一致性。

#### **4. 标准作业程序 (SOP): images 模块的基础设施构建流程**

你必须严格遵循以下四个步骤的顺序。这是一个不可更改的、自下而上的构建流程。

-----

##### **第一步：类型定义 (types.ts)**

  * **输入**: 分析 `src/drizzle/schemas/images.ts` 文件中的 `images`, `imageCategories` 等所有相关表。
  * **任务**: 在 `src/features/images/types.ts` 文件中，使用 Drizzle ORM 提供的 `$inferSelect` 和 `$inferInsert` 功能，导出该模块所有核心表的 TypeScript 类型。
  * **参考实现**: `src/features/blogs/types.ts`。

-----

##### **第二步：数据校验 (schemas.ts)**

  * **输入**: `images` 的 Drizzle Schema 和上一步生成的 Types。
  * **任务**: 在 `src/features/images/schemas.ts` 文件中，使用 `drizzle-zod` 从 Drizzle Schema 生成 Zod Schema，用于表单的创建和更新操作。
  * **参考实现**: `src/features/blogs/schemas.ts`。

-----

##### **第三步：后端逻辑 (actions/backend-actions.ts)**

  * **输入**: `images` 的 Schema、Types 和 Zod Schemas。

  * **任务**: 在 `src/features/images/actions/backend-actions.ts` 文件中，创建一套完整的、返回标准 `ActionResponse<T>` 的 CRUD Server Actions。

  * **具体Action清单**:
    你必须为以下实体创建对应的Action，函数签名应参考`blogs`模块的实现：

      * **针对 `images` 表**:
          * `createImage(data: CreateImageData)`
          * `updateImage(id: string, data: UpdateImageData)`
          * `deleteImage(id: string)`
          * `getImageById(id: string)`
          * `listImages(params: { page: number, limit: number, categoryId?: string })`
      * **针对 `imageCategories` 表**:
          * `createImageCategory(data: CreateImageCategoryData)`
          * `updateImageCategory(id: string, data: UpdateImageCategoryData)`
          * `deleteImageCategory(id: string)`
          * `listImageCategories()`

  * **约束**:

    1.  **服务器环境**: 文件顶部必须使用 `'use server'`。
    2.  **权限校验**: 所有需要权限的 Action 的第一步，必须使用 Clerk 的 `auth()` 函数进行身份验证和权限检查。
    3.  **输入验证**: 所有创建和更新操作的输入，必须使用上一步生成的 Zod Schema 进行严格验证。
    4.  **返回结构**: 所有Action都必须返回 `Promise<ActionResponse<T>>` 类型。
    5.  **特定逻辑处理**: 对于 `createImage` 和 `updateImage`，本次任务**不包含**文件上传到云存储（如S3）的逻辑。Action仅负责将图片的元数据（如URL、altText等）写入数据库。URL字段暂时可接受一个合法的字符串作为输入。

  * **标准返回结构定义 (`ActionResponse<T>`)**:

    ```typescript
    interface ActionResponse<T> {
      success: boolean;
      data?: T;
      error?: {
        message: string;
        details?: any;
      };
    }
    ```

  * **参考实现**: `src/features/blogs/actions/backend-actions.ts`。

-----

##### **第四步：前端桥梁 (hooks/backend-hooks.ts)**

  * **输入**: 上一步完成的 Actions。
  * **任务**: 在 `src/features/images/hooks/backend-hooks.ts` 文件中，为**每一个** Action 创建对应的、易于使用的 SWR Hook (`useSWR` 或 `useSWRMutation`)。
  * **约束**:
    1.  **封装模式**: 必须遵循我们 `swr-config.ts` 中的封装模式，并保持 Fetcher 的纯净。
    2.  **返回结构**: 必须遵循我们为 Hooks 制定的统一返回结构，为 UI 层提供干净、可预测的接口（例如，`listImages` 对应的 Hook 应返回 `images`, `pagination`, `isLoading`, `error`, `revalidate` 等）。
  * **参考实现**: `src/features/blogs/hooks/backend-hooks.ts`。

-----

现在，请以“高级全栈工程师”的身份开始这项基础架构的构建任务。请严格遵循上述一至四步的顺序，为 `images` 模块完整地构建其所有基础设施代码。