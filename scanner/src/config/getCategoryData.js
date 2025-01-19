import moment from 'moment';

export function getCategoryData(data) {
  switch (data[0].category) {


    case 'bus':
      return data?.map(
        ({ _id, category, voucherType, price, details, active }) => {
          const date = moment(new Date(details.date)).format('dddd,LL');
          const time = moment(new Date(details.time)).format('h:mm a');
          return {
            id: _id,
            category,
            companyName: details?.companyName,
            voucherType: `${voucherType} (${date},${time})`,
            journey: voucherType,
            report: details.report,
            date: details.date,
            time: details.time,
            logo: details.logo,
            noOfSeats: details?.noOfSeats,
            vehicleNo: details?.vehicleNo,
            price,
            details,
            active,
          };
        }
      );

    case 'cinema':
      return data?.map(({ _id, category, voucherType, details, active }) => {
        return {
          id: _id,
          category,
          profile: details.cinema,
          voucherType,
          companyName: details?.companyName,
          movie: voucherType,
          theatre: details.theatre,
          location: details.location,
          date: details.date,
          time: details.time,
          pricing: details.pricing,
          details,
          active,
        };
      });

    case 'stadium':
      return data?.map(({ _id, category, voucherType, details, active }) => {
        return {
          id: _id,
          voucherType,
          category,
          companyName: details?.companyName,
          matchType: details?.matchType,
          match: `${details.home} vs ${details.away}`,
          pricing: details.pricing,
          venue: details.venue,
          date: details.date,
          time: details.time,
          details,
          active,
        };
      });



    default:
      return []
  }
}




export function getFormatttedCategory(data) {
  const { _id, category, voucherType, price, details, active } = data


  switch (category) {

    case 'bus':
      return {
        id: _id,
        category,
        companyName: details?.companyName,
        // voucherType: `${voucherType} (${date},${time})`,
        journey: voucherType,
        report: details.report,
        date: details.date,
        time: details.time,
        logo: details.logo,
        noOfSeats: details?.noOfSeats,
        vehicleNo: details?.vehicleNo,
        price,
        details,
        active,
      };



    case 'cinema':

      return {
        id: _id,
        category,
        profile: details.cinema,
        voucherType,
        companyName: details?.companyName,
        movie: voucherType,
        theatre: details.theatre,
        location: details.location,
        date: details.date,
        time: details.time,
        pricing: details.pricing,
        details,
        active,
      };


    case 'stadium':

      return {
        id: _id,
        voucherType,
        category,
        companyName: details?.companyName,
        matchType: details?.matchType,
        match: `${details.home} vs ${details.away}`,
        pricing: details.pricing,
        venue: details.venue,
        date: details.date,
        time: details.time,
        details,
        active,
      };


    default:
      return {}
  }
}
