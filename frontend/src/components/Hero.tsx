import React from 'react'
import {HeroClient} from './HeroClient'
import {getHomepageData} from '@/lib/getHomepageData'

const Hero: React.FC = async () => {
    const homepageData = await getHomepageData()
    const hero = homepageData.hero

    if (!hero) {
        return null
    }

    return <HeroClient data={hero}/>
}

export default Hero
