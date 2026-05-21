import moment from "moment";

export function getCategoryData(data) {
  switch (data[0].type) {
    case "university":
      return data?.map(({ id, type,year, name, price, details, active }) => {
        return {
          id,
          type,
          year,
          name: `${name}(${details.formType})`,
          formType: details.formType,
          logo: details.logo,
          price,
          active,
        };
      });

    case "bus":
      return data?.map(({ id, type, name,year, price, details, active }) => {
        const date = moment(new Date(details.date)).format("dddd,LL");
        const time = moment(new Date(details.time)).format("h:mm a");
        return {
          id,
          type,
          year,
          companyName: details?.companyName,
          name: `${name} (${date},${time})`,
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
      return data?.map(({ id, type,year, name, details, active }) => {
        return {
          id,
          type,
          profile: details.cinema,
          name,
          year,
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
      return data?.map(({ id, type,year, name, details, active }) => {
        return {
          id,
          name,
          type,
          year,
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

    case "waec":
      return data?.map(({ id, name, type, year, details, active }) => {
        return {
          id,
          name,
          type,
          year,
          price: details.price,
          pricing: details.pricing,
          logo: details.logo,
          details,
          active,
        };
      });

    default:
      return data?.map(({ id, name, type, year,price, details, active }) => {
        return {
          id,
          name,
          type,
          year,
          price,
          details,
          active,
          logo: details.logo,
        };
      });
  }
}
