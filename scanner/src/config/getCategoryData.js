import moment from "moment";

export function getCategoryData(data) {
  switch (data[0].type) {
    case "bus":
      return data?.map(({ id, type, name, price, details, active }) => {
        const date = moment(new Date(details.date)).format("dddd,LL");
        const time = moment(new Date(details.time)).format("h:mm a");
        return {
          id: id,
          categoryType: type,
          companyName: details?.companyName,
          ticketName: `${name} (${date},${time})`,
          journey: name,
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
      });

    case "cinema":
      return data?.map(({ id, type, name, details, active }) => {
        return {
          id: id,
          categoryType: type,
          profile: details.cinema,
          ticketName: name,
          companyName: details?.companyName,
          movie: name,
          theatre: details.theatre,
          location: details.location,
          date: details.date,
          time: details.time,
          pricing: details.pricing,
          details,
          active,
        };
      });

    case "stadium":
      return data?.map(({ id, type, name, details, active }) => {
        return {
          id: id,
          ticketName: name,
          categoryType: type,
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
      return [];
  }
}

export function getFormatttedCategory(data) {
  const { id, type, name, price, details, active } = data;

  switch (type) {
    case "bus":
      return {
        id: id,
        categoryType: type,
        ticketName: name,
        companyName: details?.companyName,
        // ticketName: `${ticketName} (${date},${time})`,
        journey: name,
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

    case "cinema":
      return {
        id: id,
        categoryType: type,
        profile: details.cinema,
        ticketName: name,
        companyName: details?.companyName,
        movie: name,
        theatre: details.theatre,
        location: details.location,
        date: details.date,
        time: details.time,
        pricing: details.pricing,
        details,
        active,
      };

    case "stadium":
      return {
        id: id,
        ticketName: name,
        categoryType: type,
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
      return {};
  }
}
