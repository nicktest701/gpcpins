import moment from 'moment';

export function getCategoryData(data) {
  switch (data[0].category) {
    case 'university':
      return data?.map(
        ({ _id, category, voucherType, price, details, active }) => {
          return {
            id: _id,
            category,
            voucherType: `${voucherType}(${details.formType})`,
            formType: details.formType,
            logo: details.logo,
            price,
            active,
          };
        }
      );

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

    case 'waec':
      return data?.map(({ _id, voucherType, category, details, active }) => {
        return {
          id: _id,
          voucherType,
          category,
          price: details.price,
          pricing: details.pricing,
          logo: details.logo,
          details,
          active,
        };
      });

    default:
      return data?.map(
        ({ _id, voucherType, category, price, details, active }) => {
          return {
            id: _id,
            voucherType,
            category,
            price,
            details,
            active,
            logo: details.logo,
          };
        }
      );
  }
}
