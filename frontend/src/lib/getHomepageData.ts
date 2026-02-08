import {getPayload} from 'payload'
import config from '@payload-config'
import type {Homepage as HomepageType} from '@/payload-types'

/**
 * 從 Payload CMS 獲取首頁內容
 * 此函數僅在 Server Components 中使用
 */
export async function getHomepageData(): Promise<HomepageType> {
    const payload = await getPayload({config})

    return await payload.findGlobal({
        slug: 'homepage',
    })
}

/**
 * 類型輔助：提取 Hero 資料
 */
export type HeroData = NonNullable<HomepageType['hero']>

/**
 * 類型輔助：提取 About 資料
 */
export type AboutData = NonNullable<HomepageType['about']>
