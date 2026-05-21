import moment from "moment";

export function getCategoryData(data) {
  switch (data[0].type) {
    case "university":
      return data?.map(({ id, type, name, price, details, active, year }) => {
        return {
          id: id,
          category: type,
          voucherType: `${name}(${details.formType})`,
          formType: details.formType,
          logo: details.logo,
          price,
          active,
          year,
        };
      });

    case "bus":
      return data?.map(({ id, type, name, price, details, active, year }) => {
        const date = moment(new Date(details.date)).format("dddd,LL");
        const time = moment(new Date(details.time)).format("h:mm a");
        return {
          id: id,
          category: type,
          companyName: details?.companyName,
          voucherType: `${name} (${date},${time})`,
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
          year,
        };
      });

    case "cinema":
   
      return data?.map(({ id, type, name, details, active, year }) => {
        return {
          id: id,
          category: type,
          profile: details.cinema,
          voucherType: name,
          companyName: details?.companyName,
          movie: name,
          theatre: details.theatre,
          location: details.location,
          date: details.date,
          time: details.time,
          pricing: details.pricing,
          details,
          active,
          year,
        };
      });

    case "stadium":
      return data?.map(({ id, type, name, details, active, year }) => {
        return {
          id: id,
          category: type,
          voucherType: name,
          companyName: details?.companyName,
          matchType: details?.matchType,
          match: `${details.home} vs ${details.away}`,
          pricing: details.pricing,
          venue: details.venue,
          date: details.date,
          time: details.time,
          details,
          active,
          year,
        };
      });

    case "waec":
      return data?.map(({ id, name, type, details, active, year }) => {
        return {
          id: id,
          voucherType: name,
          category: type,
          price: details.price,
          pricing: details.pricing,
          logo: details.logo,
          details,
          active,
          year,
        };
      });

    default:
      return data?.map(({ id, name, type, price, details, active, year }) => {
        return {
          id: id,
          voucherType: name,
          category: type,
          price,
          details,
          active,
          year,
          logo: details.logo,
        };
      });
  }
}
