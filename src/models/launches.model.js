const launchesDatabase = require('./launches.mongo')
const launches = new Map()
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100

const launch = {
    flightNumber:100,
    mission: 'Kepler Exploration X',
    rocket:'Exporer IS1',
    launchDate: new Date('December 27, 2030'),
    target:'Kepler-1652 b',
    customers: ["ZTM","NASA"],
    upcoming: true,
    success: true
}

saveLaunch(launch)

async function existsLaunchWithId(launchId){
    return await launchesDatabase.findOne({
        flightNumber:launchId
    })
}

async function getLatestFlightNumber(){
    const latestLunch = await launchesDatabase.findOne().sort('-flightNumber')

    if(!latestLunch) return DEFAULT_FLIGHT_NUMBER

    return latestLunch.flightNumber
}

async function getAllLaunches(){
    return await launchesDatabase.find({})
}

async function saveLaunch(launch){
    const planet  = await planets.findOne({keplerName:launch.target}) 
    if(!planet){
        throw new Error('Planet name doesnt exist ')
    }
    await launchesDatabase.findOneAndUpdate({
        flightNumber:launch.flightNumber
    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(launch){
    const newFlightNumber = await getLatestFlightNumber() + 1
    
    const newLaunch = Object.assign(launch,{
        success:true,
        upcoming:true,
        customers: ['ZTM', 'NASA'],
        flightNumber:newFlightNumber
    })

    
    await saveLaunch(newLaunch)
}

// function addNewLaunch(launch){
//     latestFlightNumber++
//     launches.set(latestFlightNumber, Object.assign(launch,{
//         success:true,
//         upcoming:true,
//         customers: ['ZTM', 'NASA'],
//         flightNumber:latestFlightNumber}))
// }

async function abortLaunchById(launchId){
    const aborted = await launchesDatabase.updateOne({
        flightNumber:launchId,
    },{
        success:false,
        upcoming:false,
    })

    return aborted.modifiedCount === 1
    // const aborted = launches.get(launchId)
    // aborted.upcoming = false
    // aborted.success = false
    // return aborted
}


module.exports ={
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
}